import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import appConfig from 'appConfig';
import contentfulClient from 'contentful/contentfulClient';
import { enrollUserInCourse, isUserEnrolledInCourse } from 'fauna/functions';
import { ContentfulCourseFields } from 'models/contentful';
import { NextApiRequest, NextApiResponse } from 'next';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      // get the course ID from the url
      const courseId = req.query.id ? String(req.query.id) : undefined;
      if (!courseId) return res.status(400).send('Invalid course id');

      // figure out who they are and get their email
      const session = await getSession(req, res);
      const email = session?.user.email;
      if (!email) return res.status(400).send('No email found for user');

      // confirm they own the course that they're upgrading from
      const isEnrolled = await isUserEnrolledInCourse(email, courseId);
      if (!isEnrolled) return res.status(400).send('User not enrolled in course provided');

      // confirm the course has a newer version they can upgrade to
      const { upgradeTo } = appConfig.archivedItems.find((archivedItem) => archivedItem.id === courseId) ?? {};
      if (!upgradeTo) return res.status(400).send('Course is not upgradeable');

      // get the newer version data from contentful
      const upgradedCourse = await contentfulClient.getEntry<ContentfulCourseFields>(upgradeTo);
      const newVersionPlayerSlug = `/my-courses/${upgradedCourse.fields.slug}`;

      // check if they're already enrolled in the new version
      const [isEnrolledInUpgradedVersion] = await isUserEnrolledInCourse(email, upgradeTo);

      // just send them straight to it without doing anything if they're already enrolled
      if (isEnrolledInUpgradedVersion) return res.redirect(newVersionPlayerSlug);

      // enroll them in the new version
      const enrollments = await enrollUserInCourse(email, 'new-version-upgrade', [upgradeTo]);

      if (enrollments && enrollments[0]?.enrolled) {
        // return them back to the new course they just unlocked
        return res.redirect(newVersionPlayerSlug);
      }
      return res.status(500).send('Failed to upgrade course for user');
    }
    default:
      return res.status(405).end(`${req.method} Not Allowed`);
  }
});
