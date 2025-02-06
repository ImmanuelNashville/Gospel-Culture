import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

import { getEnrolledCoursesByEmail } from '../../fauna/functions';
import contentfulClient from '../../contentful/contentfulClient';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  const enrolledInAllCourses = session?.user['https://brighttrip.com/enrolledInAllCourses'];

  return new Promise<void>(async (resolve, reject) => {
    switch (req.method) {
      case 'GET':
        if (enrolledInAllCourses) {
          try {
            const courseData = await contentfulClient.getEntries({
              content_type: 'course',
              include: 10,
            });

            res.json(courseData.items);
            resolve();
            return;
          } catch (e) {
            if (typeof e === 'object') {
              console.error({ error: (e as Record<string, unknown>)?.message });
            }
            reject();
            return;
          }
        }

        try {
          const enrolledCourses = await getEnrolledCoursesByEmail(session?.user.email);
          const courseData = await contentfulClient.getEntries({
            content_type: 'course',
            'sys.id[in]': enrolledCourses.map((item) => item.courseId).join(),
            include: 10,
          });

          const courses = courseData.items.map((c) => ({
            ...c,
            type: enrolledCourses.find((e) => e.courseId === c.sys.id)?.orderId,
          }));

          res.json(courses);
          resolve();
        } catch (e) {
          if (typeof e === 'object') {
            console.error({ error: (e as Record<string, unknown>)?.message });
          }
          reject();
          return;
        }
        break;
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).end('Method Not Allowed');
    }
  });
});
