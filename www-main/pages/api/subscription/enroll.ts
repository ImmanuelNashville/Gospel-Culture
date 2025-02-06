import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { enrollUserInCourse, getUnenrolledCoursesByEmail, getUserByEmail } from '../../../fauna/functions';
import appConfig from '../../../appConfig';
import { SYSTEM_ORDER_IDS } from '../../../utils/enrollment';
import { createFaunaClientWithQ } from '../../../fauna/setup';
import { FaunaDocument, FaunaUserCourseData } from '../../../models/fauna';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  switch (req.method) {
    case 'POST': {
      try {
        const { courseId } = JSON.parse(req.body);

        const user = await getUserByEmail(session?.user.email);

        if (!user?.subscribed || !appConfig.subscriptionCourses.includes(courseId)) {
          return res.status(500).end('Failed to enroll user in course');
        }

        // Check if user was previously enrolled in this course, but no longer is
        const unenrolledUserCourses = await getUnenrolledCoursesByEmail(session?.user.email);
        const previousEnrollment = unenrolledUserCourses.find((uc) => uc.data.courseId === courseId);

        if (previousEnrollment) {
          // just re-enroll them rather than creating a new record
          const { faunaClient, q } = createFaunaClientWithQ();
          const updatedEnrollment = await faunaClient.query<FaunaDocument<FaunaUserCourseData>>(
            q.Update(q.Ref(q.Collection('user_courses'), String(previousEnrollment.ref.id)), {
              data: { enrolled: true, orderId: SYSTEM_ORDER_IDS.SUBSCRIPTION },
            })
          );

          if (updatedEnrollment && updatedEnrollment.data.enrolled === true) {
            return res.status(200).end('Re-enrolled successfully');
          }
        } else if (!previousEnrollment) {
          // create a new user_course document
          const [data] = await enrollUserInCourse(session?.user.email, SYSTEM_ORDER_IDS.SUBSCRIPTION, [courseId]);
          if (data && data.enrolled === true && data.courseId === courseId && data.email === session?.user.email) {
            return res.status(200).end('Enrolled successfully');
          }
        } else {
          return res.status(500).end('Failed to enroll user in course');
        }
      } catch (err) {
        let code = 500;
        let description = String(err);

        if (typeof err === 'object') {
          const error = err as Record<string, unknown>;
          if (typeof error.requestResult === 'object') {
            const { statusCode } = (err as Record<'requestResult', unknown>).requestResult as {
              statusCode?: number;
            };
            if (statusCode) {
              code = statusCode;
            }
          }
          if (typeof error.description === 'string') {
            description = error.description;
          }
        }
        return res.status(code).json(description);
      }
    }
    default:
      return res.status(405).end(`${req.method} Not Allowed`);
  }
});
