import React, { FormEvent } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/router';
import Button from './Button';
import { Course } from '../models/contentful';
import * as mpClient from '../mixpanel/client';

// Calling `loadStripe` needs to stay outside of the component’s render to avoid
// recreating the `Stripe` object on every render.
loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

export interface GiftDetails {
  giftedCourse: Course | Course[];
  toName: string;
  toEmail: string;
  fromName: string;
  fromEmail: string;
  giftNote?: string;
  className?: string;
  disabled?: boolean;
}

export default function StripeGiftButton(props: GiftDetails) {
  const router = useRouter();

  const submitOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    fetch('/api/payment/gift', {
      method: 'POST',
      body: JSON.stringify(props),
    })
      .then((res) => res.json())
      .then((json) => router.replace(json.url));

    mpClient.track(mpClient.Event.ProceedtoGiftCheckout, {
      courseId: Array.isArray(props.giftedCourse)
        ? props.giftedCourse.map((gc) => gc.sys.id).join()
        : props.giftedCourse.sys.id,
    });
  };

  const shouldBeDisabled =
    !props.giftedCourse || !props.toName || !props.toEmail || !props.fromName || !props.fromEmail || props.disabled;

  return (
    <form method="POST" onSubmit={submitOrder} className="pt-4 text-center">
      <Button variant="secondary" size="medium" type="submit" className={props.className} disable={shouldBeDisabled}>
        Proceed to Gift Payment
      </Button>
    </form>
  );
}
