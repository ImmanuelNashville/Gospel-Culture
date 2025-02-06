import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { addCartData, deleteCartData } from '../../../fauna/functions';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  switch (req.method) {
    case 'POST': {
      try {
        const { courseIds } = JSON.parse(req.body);
        await addCartData(session?.user.email, courseIds);
        return res.send(true);
      } catch (err) {
        return res.send(false);
      }
    }
    case 'DELETE': {
      try {
        const { courseId } = JSON.parse(req.body);
        await deleteCartData(session?.user.email, [courseId]);
        return res.send(true);
      } catch (err) {
        return res.send(false);
      }
    }
    default:
      return res.status(405).end(`${req.method} Not Allowed`);
  }
});
