import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { createFaunaClientWithQ } from '../../../fauna/setup';
import { FaunaDocument, FaunaUserCourseData } from '../../../models/fauna';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return;

  const session = await getSession(req, res);

  if (!session?.user['https://brighttrip.com/isAdmin']) {
    return res.status(403).send('Forbidden');
  }

  const {
    query: { refId, newEnrollmentValue },
  } = req;

  if (!refId || typeof newEnrollmentValue === 'undefined') {
    return res.status(400).send('Bad Request');
  }

  try {
    const { faunaClient, q } = createFaunaClientWithQ();

    const updatedEnrollment = await faunaClient.query<FaunaDocument<FaunaUserCourseData>>(
      q.Update(q.Ref(q.Collection('user_courses'), String(refId)), {
        data: { enrolled: String(newEnrollmentValue).toLowerCase() === 'true' },
      })
    );

    return res.status(200).json({
      updatedEnrollment,
    });
  } catch (error) {
    return res.status(500).send(String(error));
  }
});
