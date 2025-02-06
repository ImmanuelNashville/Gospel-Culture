import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { createOrder, setSubCoursesEnrollment, updateUser } from '../../../fauna/functions';
import { FaunaOrderData } from '../../../models/fauna';
import { stripe } from '../../../utils/payment';
import * as mpServer from '../../../mixpanel/server';
import { getSubscriptionPromoCode } from '../../../utils/subscription.server';

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);

  const {
    query: { session_id },
  } = req;

  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id as string);
  await updateUser(session?.user.email, { stripeCustomerId: checkoutSession.customer as string });
  const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string);
  const promoCode = await getSubscriptionPromoCode(checkoutSession, subscription);

  if (promoCode) {
    await stripe.subscriptions.update(subscription.id, {
      metadata: {
        'Promo Code': promoCode,
      },
    });
  }

  const orderData: FaunaOrderData = {
    email: session?.user.email,
    total: checkoutSession.amount_total ?? 0,
    paymentMethod: 'stripe',
    subscription: checkoutSession.subscription as string,
    type: 'subscription',
    billingInterval: subscription.items.data[0].plan.interval,
    orderedAt: new Date().toISOString(),
    ...(promoCode && { promoCode }),
  };

  try {
    mpServer.track(mpServer.Event.ServerSubscriptionPurchase, {
      billingInterval: subscription.items.data[0].plan.interval,
      price: checkoutSession.amount_total ?? 0,
      ...(promoCode && { promoCode }),
    });
  } catch (e) {
    console.error(e);
  }

  Promise.allSettled([
    await createOrder(orderData),
    await updateUser(session?.user.email, { subscribed: true }),
    await setSubCoursesEnrollment(session?.user.email, true),
  ]);

  res.redirect(`/checkout/subscription-success?sub_id=${checkoutSession.subscription}&session_id=${session_id}`);
  return;
});
