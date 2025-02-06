import type Stripe from 'stripe';
import { stripe } from './payment';

export const getSubscriptionPromoCode = async (
  checkoutSession: Stripe.Checkout.Session,
  subscription: Stripe.Subscription
) => {
  const betaCouponId = checkoutSession.metadata?.couponCode;
  let stripePromoCodeId;
  if (typeof subscription.latest_invoice === 'string') {
    const latestInvoice = await stripe.invoices.retrieve(subscription.latest_invoice);
    stripePromoCodeId =
      typeof latestInvoice.discount?.promotion_code === 'string' ? latestInvoice.discount.promotion_code : '';
  }
  let stripeSubscriptionPromoCode = '';
  if (typeof stripePromoCodeId === 'string' && stripePromoCodeId) {
    const stripePromoCode = await stripe.promotionCodes.retrieve(stripePromoCodeId);
    stripeSubscriptionPromoCode = stripePromoCode.code;
  }

  return betaCouponId ?? stripeSubscriptionPromoCode;
};
