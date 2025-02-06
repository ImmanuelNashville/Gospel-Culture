import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import contentfulClient from '../../../contentful/contentfulClient';
import { getUserByEmail } from '../../../fauna/functions';
import { createFaunaClientWithQ } from '../../../fauna/setup';
import { FaunaDocument, FaunaOrderData, FaunaUserCourseData } from '../../../models/fauna';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send(`${req.method} Not Allowed`);
  }

  const session = await getSession(req, res);

  if (!session?.user['https://brighttrip.com/isAdmin']) {
    return res.status(403).send('Forbidden');
  }

  const {
    query: { email },
  } = req;

  if (!email) return res.status(400).send('Bad Request');

  const { faunaClient, q } = createFaunaClientWithQ();

  const userResponse = await getUserByEmail(String(email));
  const userEnrollments = await faunaClient.query<FaunaDocument<FaunaDocument<FaunaUserCourseData>[]>>(
    q.Map(q.Paginate(q.Match(q.Index('courses_by_user_email'), email)), (ref) => q.Get(ref))
  );
  const userOrders = await faunaClient.query<FaunaDocument<FaunaDocument<FaunaOrderData>[]>>(
    q.Map(q.Paginate(q.Match(q.Index('orders_by_user_email'), email)), (ref) => q.Get(ref))
  );

  const courses = await contentfulClient.getEntries({
    content_type: 'course',
    'sys.id[in]': userEnrollments.data.map((enrollment) => enrollment.data.courseId).join(','),
    select: 'sys.id,fields.title,fields.tileThumbnail',
  });

  try {
    return res.status(200).json({
      user: userResponse,
      enrollments: userEnrollments,
      courses,
      orders: userOrders.data,
    });
  } catch (error) {
    return res.status(500).send(String(error));
  }
});
