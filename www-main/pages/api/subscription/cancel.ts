import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getUserByEmail } from '../../../fauna/functions';
import { stripe } from '../../../utils/payment';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth0Session = await getSession(req, res);

  if (!auth0Session) {
    res.redirect(`/api/auth/login`);
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const user = await getUserByEmail(auth0Session?.user.email);
    if (!user) {
      return res.status(400).end('No user found for email address');
    }
    if (!user.email) {
      return res.status(400).end('User found, does not have valid email address');
    }

    const { subscriptionId, cancelAtPeriodEnd } = JSON.parse(req.body);
    const canceled = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: cancelAtPeriodEnd });

    if (canceled) {
      return res.json({ message: 'ok' });
    }

    return res
      .status(500)
      .end(`An error occurred when updating user subscription. Stripe Subscription ID: ${subscriptionId}`);
  } catch (err: unknown) {
    let code = 500;
    if (typeof err === 'object') {
      const errorCode = (err as Record<string, unknown>).statusCode as number;
      if (errorCode) {
        code = errorCode;
      }
    }
    return res.status(code).json(err);
  }
});
