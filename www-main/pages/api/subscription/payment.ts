import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import type { Stripe } from 'stripe';
import { getUserByEmail } from '../../../fauna/functions';
import { SUBSCRIPTION_PATH } from '../../../utils/constants';
import { getStripeCustomerFields, stripe } from '../../../utils/payment';

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
      throw new Error('User not found for email');
    }
    if (!user.email) {
      throw new Error('User does not have an email address');
    }

    const { subTerm, couponCode, stripePromotionCode } = JSON.parse(req.body);

    const sessionData = await buildStripeCheckoutSession(
      req,
      user.email,
      subTerm,
      couponCode,
      stripePromotionCode,
      user?.stripeCustomerId
    );

    const session = await stripe.checkout.sessions.create(sessionData);

    return res.json({ url: session.url });
  } catch (err) {
    console.error(err);
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

export async function buildStripeCheckoutSession(
  req: NextApiRequest,
  email: string,
  subTerm: 'annual' | 'monthly',
  couponCode: string,
  stripePromotionCode?: {
    id: string;
    code: string;
  },
  stripeId?: string
): Promise<Stripe.Checkout.SessionCreateParams> {
  const sessionData: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    mode: 'subscription',
    ...(!couponCode && !stripePromotionCode?.id && { allow_promotion_codes: true }),
    ...(couponCode && { discounts: [{ coupon: couponCode }] }),
    ...(stripePromotionCode?.id && !couponCode && { discounts: [{ promotion_code: stripePromotionCode.id }] }),
    line_items: [
      {
        price:
          subTerm === 'annual'
            ? process.env.NEXT_PUBLIC_APPLICATION_ENV === 'development'
              ? 'price_1KMmHRAsopenkPvSKndQrr2n'
              : 'price_1KW2aJAsopenkPvS7Qy6D7WD'
            : process.env.NEXT_PUBLIC_APPLICATION_ENV === 'development'
            ? 'price_1KMmHRAsopenkPvSPEBTrk2B'
            : 'price_1KW2aJAsopenkPvSwxsuNbvL',
        quantity: 1,
      },
    ],
    metadata: {
      ...(couponCode && { couponCode }),
    },
    billing_address_collection: 'required',
    success_url: `${req.headers.origin}/api/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}${SUBSCRIPTION_PATH}?canceled=true&term=${
      subTerm === 'annual' ? 'annual' : 'monthly'
    }${stripePromotionCode?.code ? `&promo=${stripePromotionCode?.code}` : ''}`,
  };

  if (email) {
    // Either use the exisiting Stripe Customer for the user or pre-fill a new one with their email
    const [customerFieldName, customerFieldValue] = await getStripeCustomerFields(stripe, email, stripeId);
    sessionData[customerFieldName] = customerFieldValue;
  }

  return sessionData;
}
