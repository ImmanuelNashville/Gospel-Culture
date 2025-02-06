import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Button from './Button';
import Text from './Text';
import * as mpClient from '../mixpanel/client';
import { SUBSCRIPTION_CODES } from '../utils/subscription.client';
import { useUserDataContext } from '../hooks/useUserDataContext';
import { SUBSCRIPTION_PATH } from '../utils/constants';
import type Stripe from 'stripe';
import appConfig from '../appConfig';

export type SubscriptionTerm = 'monthly' | 'annual';

const prices = {
  annual: 499,
  monthly: 799,
};

interface SubscriptionPricingProps {
  stripePromotionCode: Stripe.PromotionCode | null;
  updateRoutes?: boolean;
}

const SubscriptionPricing = ({ stripePromotionCode, updateRoutes = true }: SubscriptionPricingProps) => {
  const router = useRouter();
  const [paymentInterval, setPaymentInterval] = useState<SubscriptionTerm>(() => {
    return router.query.term === 'annual' || router.query.term === 'monthly' ? router.query.term : 'annual';
  });

  const { user } = useUserDataContext();

  const promoCode = user?.subBetaEnroll
    ? paymentInterval === 'annual'
      ? SUBSCRIPTION_CODES.ANNUAL
      : SUBSCRIPTION_CODES.MONTHLY
    : null;

  const price = Math.round(
    prices[paymentInterval] * (appConfig.sale.isActive ? 1 - appConfig.sale.percentageDiscount / 100 : 1)
  );

  useEffect(() => {
    if (updateRoutes) {
      const url = new URL(window.location.href);
      url.searchParams.set('term', paymentInterval);
      router.replace(url);

      mpClient.track(mpClient.Event.SubscriptionPriceView, {
        billingInterval: paymentInterval === 'monthly' ? 'month' : 'year',
        price,
        promoCode: promoCode ?? undefined,
      });
    }
    // TODO: make the router not re-run this effect every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentInterval, promoCode]);

  const subscribe = (subTerm: SubscriptionTerm, couponCode: string | null) => {
    if (!user) {
      const currentURL = new URL(window.location.href);
      const newParams = new URLSearchParams();
      newParams.set('auth0Params', encodeURIComponent(currentURL.searchParams.toString()));
      return router.push(`/api/auth/login?returnTo=${SUBSCRIPTION_PATH}?${newParams.toString()}`);
    }

    const body = {
      subTerm,
      couponCode,
      stripePromotionCode: {
        id: stripePromotionCode?.id,
        code: stripePromotionCode?.code,
      },
    };

    if (appConfig.sale.isActive && Number(appConfig.sale.percentageDiscount) === 30) {
      body.couponCode = SUBSCRIPTION_CODES.SALE_30_PERCENT_OFF;
      body.stripePromotionCode = { id: undefined, code: undefined };
    }

    fetch('/api/subscription/payment', {
      method: 'POST',
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((json) => router.replace(json.url));
  };

  return (
    <div>
      <div className="flex flex-col items-center pt-8 pb-6 px-8">
        <h1 className="text-headline6 lg:text-headline5 font-bold">Start Your Journey Today</h1>
        <div className="flex justify-center items-center bg-gray-200 rounded-full p-1 mt-6 mb-4">
          <button
            className={`rounded-full px-5 py-1.5 ${
              paymentInterval === 'monthly'
                ? 'bg-bt-teal text-white border-2 border-bt-teal'
                : 'text-gray-800 outline-bt-teal-light bg-gray-200'
            }`}
            onClick={() => setPaymentInterval('monthly')}
          >
            Monthly
          </button>
          <button
            className={`rounded-full px-5 py-1.5 ${
              paymentInterval === 'annual'
                ? 'bg-bt-teal text-white border-2 border-bt-teal'
                : 'text-gray-800 outline-bt-teal-light bg-gray-200'
            }`}
            onClick={() => setPaymentInterval('annual')}
          >
            Yearly
          </button>
        </div>
        {paymentInterval === 'annual' && (
          <div className="mt-1 bg-bt-orange rounded-full px-5 py-1 text-white text-[14px] uppercase font-bold">
            Save 37%
          </div>
        )}
        <div className="mt-3 items-center flex">
          <Text variant="headline4" className="mr-2">
            $
          </Text>
          <Text variant="headline2">{(price / 100).toFixed(2)}</Text>
        </div>
        <Text variant="caption" className={appConfig.sale.isActive ? 'mb-1' : 'mb-3'}>
          {appConfig.sale.isActive && paymentInterval === 'monthly' ? 'for your first' : 'per'} month
          {paymentInterval === 'annual' ? ' (billed yearly)' : ''}
        </Text>
        {appConfig.sale.isActive ? (
          <Text variant="caption">(normally ${(prices[paymentInterval] / 100).toFixed(2)})</Text>
        ) : (
          ''
        )}
        {user?.subBetaEnroll && !appConfig.sale.isActive && (
          <div className="p-4 border-2 border-bt-orange rounded-lg flex flex-col gap-1 w-full">
            <Text variant="bodyBold">
              As a participant in our beta, you get {paymentInterval === 'annual' ? '25% off' : '3 months free'}!
            </Text>
            <Text variant="caption">Discount will be automatically applied at checkout</Text>
          </div>
        )}
        {stripePromotionCode?.code && !appConfig.sale.isActive && !user?.subBetaEnroll && (
          <div className="p-4 border-2 border-bt-orange rounded-lg flex flex-col gap-1 w-full">
            <Text variant="bodyBold">
              Promo code <span className="text-bt-teal font-bold">{stripePromotionCode.code}</span> gets you 15% off!
            </Text>
            <Text variant="caption">Discount will be automatically applied at checkout</Text>
          </div>
        )}
      </div>
      <div className="bg-gray-50 px-8 py-6 pb-8 text-left">
        <ul className="px-4 md:px-12 withBTBullets space-y-2.5">
          <li>Hundreds of video lessons</li>
          <li>Constantly updated library of content</li>
          <li>Discounts on premium skill courses</li>
          <li>7-day money-back guarantee</li>
        </ul>
        <Button
          variant="secondary"
          size="medium"
          className="w-full mt-6"
          onClick={() => subscribe(paymentInterval, promoCode)}
        >
          {user ? 'Subscribe' : 'Sign Up & Subscribe'}
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPricing;
