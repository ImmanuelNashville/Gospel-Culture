import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import contentfulClient from '../../contentful/contentfulClient';
import courseNamesMap from '../../courseNames';
import { createOrder, enrollUserInCourse, getUserByEmail } from '../../fauna/functions';
import { ContentfulCourseFields } from '../../models/contentful';

export const REDEMPTION_CODES = {
  PHILLIPS: courseNamesMap['How to Appreciate Art'],
  HEMPHILL: courseNamesMap['How to Appreciate Art'],
  HAMILTONIAN: courseNamesMap['How to Appreciate Art'],
  KREEGER: courseNamesMap['How to Appreciate Art'],
  STABLE: courseNamesMap['How to Appreciate Art'],
  NGA: courseNamesMap['How to Appreciate Art'],
  SAILINGPRESS: courseNamesMap['Sailing Part 1: Getting Started'],
  PULITZERSTAFF: courseNamesMap['Travel Journalism'],
  FAGERLIAURORAS: courseNamesMap['How to Catch the Northern Lights'],
  SENJACAMP: courseNamesMap['How to Catch the Northern Lights'],
  BEDNBIKE: courseNamesMap['How to Catch the Northern Lights'],
  ALTA5MILE: courseNamesMap['How to Catch the Northern Lights'],
} as Record<string, string>;

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Unauthenticated if there's no session
  const session = await getSession(req, res);
  if (!session) {
    console.warn('Redemption code attempt with logged out user');
    return res.status(401);
  }

  // Unauthorized if there's no user corresponding to the session
  const user = await getUserByEmail(session?.user.email);
  if (!user) {
    console.warn('Redemption code attempt with unknown user');
    return res.status(403);
  }

  // Make sure the request was properly formatted
  const { code } = JSON.parse(req.body);
  if (!code || typeof code !== 'string') return res.status(400);

  // Figure out what to do based on the code
  const formattedCode = code.trim().toUpperCase();
  const matchingCourseId = REDEMPTION_CODES[formattedCode];

  if (matchingCourseId) {
    // grab the course
    const course = await contentfulClient.getEntry<ContentfulCourseFields>(matchingCourseId);

    // enroll the user in the course for free
    const order = await createOrder({
      email: user.email,
      items: [
        {
          id: course.sys.id,
          price: 0,
          creator: course.fields.creator?.sys.id ?? 'Unknown Creator ID',
          isPreorder: false,
        },
      ],
      total: 0,
      paymentMethod: 'redemption-code',
      type: 'redemption-code',
      promoCode: {
        code: formattedCode,
        percentageDiscount: 100,
        allowedCourses: [course.sys.id],
      },
      orderedAt: new Date().toISOString(),
    });
    if (order) {
      const enrollment = await enrollUserInCourse(user.email, order.ref.id, [course.sys.id]);
      if (enrollment) {
        console.info('Successfully enrolled user via redemption code', course.sys.id, formattedCode);
        return res.status(200).json({ redirectUrl: `/my-courses/${course.fields.slug}` });
      }

      console.error('Error creating enrollment from redemption order', order.ref.id, order);
      return res.status(500).json({ msg: 'Error creating enrollment from redemption order' });
    }
    console.error('Error creating redemption order', matchingCourseId, formattedCode);
    return res.status(500).json({ msg: 'Error creating redemption order' });
  }
  console.warn('Invalid redemption code attempted', formattedCode);
  return res.status(404).json({ msg: 'Invalid redemption code' });
});
