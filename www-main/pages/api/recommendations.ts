import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import contentfulClient from '../../contentful/contentfulClient';
import { getEnrolledCoursesByEmail } from '../../fauna/functions';
import { ContentfulCourseFields, Course } from '../../models/contentful';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  switch (req.method) {
    case 'GET': {
      try {
        const enrolledCourses = await getEnrolledCoursesByEmail(session?.user.email);
        const coursesToRecommend: Course[] = [];

        const { items: allCourses } = await contentfulClient.getEntries<ContentfulCourseFields>({
          content_type: 'course',
          include: 2,
        });

        for (const enrolledCourse of enrolledCourses) {
          const currentCourse = allCourses.find((course) => course.sys.id === enrolledCourse.courseId);
          const currentCreator = currentCourse?.fields.creator;

          if (currentCreator) {
            const otherCoursesByThisCreator = allCourses.filter(
              (course) => course.fields.creator?.sys.id === currentCreator.sys.id
            );
            for (const course of otherCoursesByThisCreator) {
              coursesToRecommend.push(course);
            }
          }

          if (currentCreator && currentCreator.sys.contentType.sys.id === 'creatorTeam') {
            // @ts-expect-error creator doesn't know about teams yet, need to figure that out
            const memberIds = currentCreator.fields.members?.map((member) => member.sys.id);
            const otherCoursesByCreatorsInTeam = allCourses.filter((course) =>
              memberIds.includes(course.fields.creator?.sys.id)
            );
            for (const course of otherCoursesByCreatorsInTeam) {
              coursesToRecommend.push(course);
            }
          }

          if (currentCourse) {
            const categoryIds = currentCourse.fields.category.map((cat) => cat.sys.id);
            const coursesInSameCategories = allCourses.filter((course) =>
              categoryIds.some((catId) => course.fields.category.map((c) => c.sys.id).includes(catId))
            );
            for (const course of coursesInSameCategories) {
              coursesToRecommend.push(course);
            }
          }
        }

        const enrolledCourseIds = enrolledCourses.map((enrollment) => enrollment.courseId);
        const coursesWithoutAlreadyOwned = coursesToRecommend.filter(
          (course) => !enrolledCourseIds.includes(course?.sys.id ?? '')
        );

        const relevanceMap = coursesWithoutAlreadyOwned.reduce((map, course) => {
          if (map[course.sys.id]) {
            map[course.sys.id] += 1;
          } else {
            map[course.sys.id] = 1;
          }
          return map;
        }, {} as Record<string, number>);

        const uniqueCourseIds = new Set(coursesWithoutAlreadyOwned.map((course) => course.sys.id));
        const dedupedCourses = Array.from(uniqueCourseIds)
          .map((courseId) => coursesToRecommend.find((course) => course.sys.id === courseId))
          .filter(Boolean);

        dedupedCourses.sort((course1, course2) => {
          const c1Id = course1?.sys.id ?? '';
          const c2Id = course2?.sys.id ?? '';

          if (relevanceMap[c1Id] > relevanceMap[c2Id]) {
            return -1;
          } else if (relevanceMap[c1Id] < relevanceMap[c2Id]) {
            return 1;
          } else {
            return 0;
          }
        });

        res.setHeader('Cache-Control', 'private, max-age=43200'); // 12 hours
        return res.status(200).json(dedupedCourses);
      } catch (error) {
        console.error(error);
        return res.status(500).send(error);
      }
    }
    default: {
      return res.status(405).send(`${req.method} Not Allowed`);
    }
  }
});
