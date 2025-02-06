import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import contentfulClient from '../../contentful/contentfulClient';
import { getCoursesProgressByUser, getEnrolledCoursesByEmail } from '../../fauna/functions';
import { ContentfulCourseFields, Course } from '../../models/contentful';
import { getLessonCountForCourse } from '../../utils/courses';

export interface CoursesProgressAPIResponse {
  progressPercentages: Record<Course['sys']['id'], number>;
  coursesInProgress: Course[];
}

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  switch (req.method) {
    case 'GET': {
      const courseProgressRecords = await getCoursesProgressByUser(session?.user.email);
      const userCoursesData = await getEnrolledCoursesByEmail(session?.user.email);
      const enrolledCourseIds = userCoursesData.filter((record) => record.enrolled).map((record) => record.courseId);
      const courseIdsWithSomeProgress = courseProgressRecords
        ?.filter((record) => {
          const isAllowedToPlay =
            enrolledCourseIds.includes(record.data.courseId) ||
            session?.user['https://brighttrip.com/enrolledInAllCourses'];
          return Object.keys(record.data.videoProgress).length > 0 && isAllowedToPlay;
        })
        .map((record) => record.data.courseId);

      const { items: coursesInProgress } = await contentfulClient.getEntries<ContentfulCourseFields>({
        content_type: 'course',
        include: 10,
        'sys.id[in]': courseIdsWithSomeProgress?.join(),
      });

      const progressPercentages = coursesInProgress.reduce((result, course) => {
        const courseProgress = courseProgressRecords?.find((record) => record.data.courseId === course.sys.id);
        if (courseProgress) {
          const completedLessonsCount = courseProgress.data.completedLessons.length;
          const totalLessonsInCourseCount = getLessonCountForCourse(course);
          const percentageOfLessonsCompleted = (completedLessonsCount / totalLessonsInCourseCount) * 100;
          result[course.sys.id] = percentageOfLessonsCompleted;
        }
        return result;
      }, {} as Record<Course['sys']['id'], number>);

      return res.json({ progressPercentages, coursesInProgress });
    }
    default:
      return res.status(405).end(`${req.method} Not Allowed`);
  }
});
