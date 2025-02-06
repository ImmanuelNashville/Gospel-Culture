import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/router';
import Button, { ButtonProps } from './Button';
import * as mpClient from '../mixpanel/client';
import * as fbpixel from '../lib/fbpixel';
import * as gtag from '../lib/gtag';
import { getAdjustedPrice } from '../utils/sales';
import { Course } from '../models/contentful';
import { CartCourse } from '../context/cart';
import { useUserDataContext } from '../hooks/useUserDataContext';

// Calling `loadStripe` needs to stay outside of the component’s render to avoid
// recreating the `Stripe` object on every render.
loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

export default function StripeCourseBuyNowButton({
  course,
  buttonProps,
  children,
}: {
  course: Course;
  children: React.ReactNode;
  buttonProps?: ButtonProps;
}) {
  const { user } = useUserDataContext();

  const buyNowCourse: CartCourse = {
    id: course.sys.id,
    title: course.fields.title,
    creatorName: course.fields.creator?.fields.name ?? 'Unknown Creator',
    price: getAdjustedPrice(course.fields.price ?? 0, course.sys.id, {}),
    imgUrl: course.fields.tileThumbnail?.fields.file.url ?? '',
    slug: course.fields.slug,
  };
  const router = useRouter();

  const submitOrder = () => {
    try {
      mpClient.track(mpClient.Event.Checkout, {
        cart: [buyNowCourse],
      });

      fbpixel.event(fbpixel.Action.track, fbpixel.StandardEvent.InitiateCheckout, {
        content_category: 'course',
        content_ids: [buyNowCourse.id],
        contents: [{ id: buyNowCourse.id, quantity: 1 }],
        currency: 'USD',
        num_items: 1,
        value: buyNowCourse.price / 100,
      });
      gtag.event(gtag.Action.BeginCheckout, {
        currency: 'USD',
        value: buyNowCourse.price / 100,
        items: [
          {
            item_id: buyNowCourse.id,
            item_name: buyNowCourse.title,
            currency: 'USD',
            price: buyNowCourse.price / 100,
            quantity: 1,
          },
        ],
      });
    } catch (e) {
      console.error(e);
    } finally {
      const buyNowURL = `/api/payment/checkout-session?cid=${buyNowCourse.id}`;

      if (!user) {
        router.replace(`/api/auth/login?returnTo=${encodeURI(buyNowURL)}`);
      } else {
        router.replace(buyNowURL);
      }
    }
  };

  return (
    <Button {...buttonProps} onClick={submitOrder}>
      {children}
    </Button>
  );
}
