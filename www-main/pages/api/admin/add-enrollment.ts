import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { enrollUserInCourse } from '../../../fauna/functions';
import { SYSTEM_ORDER_IDS } from '../../../utils/enrollment';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return;

  const session = await getSession(req, res);

  if (!session?.user['https://brighttrip.com/isAdmin']) {
    return res.status(403).send('Forbidden');
  }

  const { email, courseIds, orderId } = JSON.parse(req.body);

  if (!email || !courseIds || courseIds.length === 0) {
    return res.status(400).send('Bad Request');
  }

  const orderIdToUse = orderId ?? SYSTEM_ORDER_IDS.ADMIN_ENROLL;

  try {
    const newEnrollments = await enrollUserInCourse(email, orderIdToUse, courseIds);
    return res.status(200).json({
      newEnrollments,
    });
  } catch (error) {
    return res.status(500).send(String(error));
  }
});
