import { useEffect } from 'react';
import Layout from '../../components/Layout';

import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import Button from '../../components/Button';
import CheckoutSuccessSkeleton from '../../components/CheckoutSuccessSkeleton';
import contentfulClient from '../../contentful/contentfulClient';
import * as fbpixel from '../../lib/fbpixel';
import * as gtag from '../../lib/gtag';
import * as mpClient from '../../mixpanel/client';
import { stripe } from '../../utils/payment';
import { getSubscriptionPromoCode } from '../../utils/subscription.server';

export default function SubscriptionSuccessPage(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useEffect(() => {
    const interval = props.stripeSubscriptionResponse.items.data[0].plan.interval;

    try {
      mpClient.track(mpClient.Event.SubscriptionPurchase, {
        billingInterval: interval,
        price: props.priceInCents,
        ...(props.promoCode && { promoCode: props.promoCode }),
      });
      gtag.event(gtag.Action.Purchase, {
        currency: 'USD',
        transaction_id: props.stripeSubscriptionResponse.id,
        value: props.priceInCents / 100,
        items: [
          {
            item_id: String(props.stripeSubscriptionResponse.items.data[0].plan.product ?? ''),
            item_name: `Subscription - ${props.stripeSubscriptionResponse.items.data[0].plan.interval}`,
            currency: 'USD',
            price: props.priceInCents / 100,
            quantity: 1,
            ...(props.promoCode && { coupon: props.promoCode }),
          },
        ],
      });
      fbpixel.event(fbpixel.Action.track, fbpixel.StandardEvent.Subscribe, {
        value: props.priceInCents / 100,
        currency: 'USD',
        // from stripe
        predicted_ltv: 50.12,
      });
      fbpixel.event(fbpixel.Action.track, fbpixel.StandardEvent.Purchase, {
        content_ids: [interval + '_subscription'],
        content_name: `Subscription (${interval})`,
        content_type: 'subscription',
        contents: [
          {
            id: interval + '_subscription',
            quantity: 1,
          },
        ],
        currency: 'USD',
        num_items: 1,
        value: props.priceInCents / 100,
      });
    } catch (e) {
      console.error(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout title="You're In!" description="Welcome to Bright Trip" fullBleed transparentHeader>
      <CheckoutSuccessSkeleton>
        <h1 className="mt-2 text-4xl font-bold dark:text-gray-100">You&apos;re in!</h1>
        <div className="max-w-sm text-body text-left font-bodycopy text-black/70 dark:text-white/80 space-y-4 leading-relaxed">
          <p>
            We&apos;re so excited to have you as a Bright Trip subscriber. We&apos;re on a mission to equip you with the
            practical knowledge, historical context, and cultural awareness to take on your next destination with
            confidence.
          </p>
          <p>
            You can manage your subscription anytime via <span className="hidden md:inline">your profile picture</span>
            <span className="md:hidden">the menu</span> in the top right, then select <em>View Profile</em>.
          </p>
          <p>
            We couldn&apos;t do this without support from people like you, so thank you again for joining us. Drop us a
            line anytime at{' '}
            <a className="text-bt-teal dark:text-bt-teal-light underline" href="mailto:support@brighttrip.com">
              support@brighttrip.com
            </a>{' '}
            if you have any questions or feedback.
          </p>
          <p>We&apos;ll see you out there!</p>
          <p>— The Bright Trip Team</p>
        </div>
        <Link href="/subscription">
          <Button variant="primary" className="px-7 mt-2">
            Start Watching
          </Button>
        </Link>
      </CheckoutSuccessSkeleton>
    </Layout>
  );
}

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(context: GetServerSidePropsContext) {
    const {
      query: { sub_id, session_id },
    } = context;

    if (sub_id) {
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id as string);
      const stripeSubscriptionResponse = await stripe.subscriptions.retrieve(sub_id as string);
      const promoCode = await getSubscriptionPromoCode(checkoutSession, stripeSubscriptionResponse);
      const heroImage = await contentfulClient.getAsset('6jRD2hgywo69QYkEhJM3Bm');
      return {
        props: {
          stripeSubscriptionResponse,
          promoCode,
          priceInCents: checkoutSession.amount_total ?? 0,
          heroImage,
        },
      };
    } else {
      return {
        redirect: { destination: '/library', permanent: false },
        props: {},
      };
    }
  },
});
