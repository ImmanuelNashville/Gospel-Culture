import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import type Stripe from 'stripe';
import { getUserByEmail } from '../../../fauna/functions';
import { stripe, validateStripeCustomerId } from '../../../utils/payment';

type UpcomingInvoiceMap = Record<Stripe.Subscription['id'], Stripe.Response<Stripe.Invoice>>;
type PromoCodeMap = Record<Stripe.Subscription['id'], Stripe.Response<Stripe.PromotionCode> | null>;
export interface SubscriptionDetailsApiResponse {
  subList: {
    data: Stripe.Subscription[];
  };
  upcomingInvoices: UpcomingInvoiceMap;
  promoCodes: PromoCodeMap;
}

export default withApiAuthRequired(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth0Session = await getSession(req, res);

  if (!auth0Session) {
    res.redirect(`/api/auth/login`);
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const user = await getUserByEmail(auth0Session?.user.email);

  if (!user) {
    return res.status(400).end('No user found for email provided');
  }

  if (!user.stripeCustomerId) {
    return res.status(400).end('User does not have a stripe customer ID');
  }

  const validStripeId = await validateStripeCustomerId(stripe, user.stripeCustomerId);

  if (validStripeId) {
    const activeSubList = await stripe.subscriptions.list({
      customer: user?.stripeCustomerId,
      status: 'active',
    });

    const trialSubList = await stripe.subscriptions.list({
      customer: user?.stripeCustomerId,
      status: 'trialing',
    });

    const subList = {
      data: [...activeSubList.data, ...trialSubList.data],
    };

    const upcomingInvoices = (
      await Promise.allSettled(
        subList.data.map(async (sub) => {
          return await stripe.invoices.retrieveUpcoming({
            subscription: sub.id,
          });
        })
      )
    ).reduce((acc, element) => {
      if (Object.keys(element).includes('value')) {
        const invoice = (element as Record<'value', Stripe.Response<Stripe.Invoice>>).value;
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          acc[invoice.subscription] = invoice;
        }
      }
      return acc;
    }, {} as UpcomingInvoiceMap);

    const promoCodes = (
      await Promise.allSettled(
        subList.data.map(async (sub) => {
          const { id } = sub;
          let code: Stripe.Response<Stripe.PromotionCode> | null = null;
          if (typeof sub.discount?.promotion_code === 'string') {
            code = await stripe.promotionCodes.retrieve(sub.discount.promotion_code);
          }
          return { id, code };
        })
      )
    ).reduce((acc, element) => {
      if (Object.keys(element).includes('value')) {
        const subWithCode = (
          element as Record<'value', { id: string; code: Stripe.Response<Stripe.PromotionCode> | null }>
        ).value;
        acc[subWithCode.id] = subWithCode.code;
      }
      return acc;
    }, {} as PromoCodeMap);

    res.json({ subList, upcomingInvoices, promoCodes });
  } else {
    res.json([]);
  }
});
