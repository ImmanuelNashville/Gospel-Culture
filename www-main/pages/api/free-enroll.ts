import { getSession, Session, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import contentfulClient from '../../contentful/contentfulClient';
import {
  enrollUserInCourse,
  getEnrolledCoursesByEmail,
  getUnenrolledCoursesByEmail,
  getUserByEmail,
  signUpUser,
} from '../../fauna/functions';
import { createFaunaClientWithQ } from '../../fauna/setup';
import { ContentfulCourseFields } from '../../models/contentful';
import { Auth0User, FaunaDocument, FaunaUserCourseData } from '../../models/fauna';
import { coursePrice } from '../../utils/courses.server';
import { SYSTEM_ORDER_IDS } from '../../utils/enrollment';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  switch (req.method) {
    case 'POST': {
      const { courseId } = JSON.parse(req.body);
      return await enrollUserInFreeCourse(courseId, res, session);
    }
    case 'GET': {
      const { courseId } = req.query;
      return await enrollUserInFreeCourse(String(courseId), res, session, req.query);
    }
    default:
      return res.status(405).end(`${req.method} Not Allowed`);
  }
});

const enrollUserInFreeCourse = async (
  courseId: string,
  res: NextApiResponse,
  session: Session | undefined | null,
  query?: NextApiRequest['query']
) => {
  try {
    const price = await coursePrice(courseId, 0, false);
    let user = await getUserByEmail(session?.user.email);
    if (!user) {
      const newUser = await signUpUser(session?.user as Auth0User);
      if (newUser && newUser.data) {
        user = newUser.data;
      } else {
        console.error(`Error creating new user in Free Enroll flow — ${session?.user.email}`);
        return res.status(500).send('Error creating new user');
      }
    }
    const course = await contentfulClient.getEntry<ContentfulCourseFields>(courseId);
    if (price === 0) {
      // Check if user is currently enrolled in this course (for login redirect use case)
      const enrolledUserCourses = await getEnrolledCoursesByEmail(session?.user.email);
      if (enrolledUserCourses.find((ec) => ec.courseId === courseId)) {
        return res.redirect(`/my-courses/${course.fields.slug}${query?.v ? `?v=${query?.v}` : ''}`);
      }
      // Check if user was previously enrolled in this course
      const unenrolledUserCourses = await getUnenrolledCoursesByEmail(session?.user.email);
      const previousEnrollment = unenrolledUserCourses.find((uc) => uc.data.courseId === courseId);

      if (previousEnrollment) {
        // just re-enroll them rather than creating a new record
        const { faunaClient, q } = createFaunaClientWithQ();
        const updatedEnrollment = await faunaClient.query<FaunaDocument<FaunaUserCourseData>>(
          q.Update(q.Ref(q.Collection('user_courses'), String(previousEnrollment.ref.id)), {
            data: { enrolled: true, orderId: SYSTEM_ORDER_IDS.FREE },
          })
        );
        if (updatedEnrollment && updatedEnrollment.data.enrolled === true) {
          return handleSuccess(res, course.fields.slug, query);
        }
      } else if (!previousEnrollment) {
        // Create a new user_course record
        const [data] = await enrollUserInCourse(session?.user.email, SYSTEM_ORDER_IDS.FREE, [courseId]);
        if (data && data.enrolled === true && data.courseId === courseId && data.email === session?.user.email) {
          return handleSuccess(res, course.fields.slug, query);
        }
      } else {
        return res.status(500).end('Failed to enroll user in free course');
      }
    } else {
      return res.status(400).end('Course not eligible for free enrollment');
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
};

function handleSuccess(res: NextApiResponse, courseSlug?: string, query?: NextApiRequest['query']) {
  if (!query?.v) {
    console.info('successfully enrolled a user in a free course via "watch now" button');
    return res.status(200).end('Enrolled successfully');
  } else {
    console.info('successfully enrolled user in a free course via video interstitial');
    return res.redirect(`/my-courses/${courseSlug}?v=${query.v}`);
  }
}
