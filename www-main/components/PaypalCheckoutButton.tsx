import React, { FormEvent } from 'react';
import { useRouter } from 'next/router';
import * as mpClient from '../mixpanel/client';
import * as fbpixel from '../lib/fbpixel';
import * as gtag from '../lib/gtag';
import { getAdjustedPrice } from '../utils/sales';
import { useCartContext } from '../hooks/useCartContext';

export default function PaypalCheckoutButton() {
  const router = useRouter();
  const { cart, promo } = useCartContext();

  const adjustedItems = cart.map((item) => ({
    ...item,
    price: getAdjustedPrice(item.price, item.id, { promoCode: promo?.appliedCode }),
  }));
  const adjustedTotal = adjustedItems.reduce((sum, i) => i.price + sum, 0);

  const submitOrder = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      mpClient.track(mpClient.Event.CheckoutWithPaypal, {
        cart: adjustedItems,
      });

      fbpixel.event(fbpixel.Action.track, fbpixel.StandardEvent.InitiateCheckout, {
        content_category: 'course',
        content_ids: adjustedItems.map((c) => c.id),
        contents: adjustedItems.map((c) => ({ id: c.id, quantity: 1 })),
        currency: 'USD',
        num_items: adjustedItems.length,
        value: adjustedTotal / 100,
      });
      gtag.event(gtag.Action.BeginCheckout, {
        currency: 'USD',
        value: adjustedTotal / 100,
        ...(promo?.appliedCode?.code && { coupon: promo?.appliedCode?.code }),
        items: cart.map((i) => ({
          item_id: i.id,
          item_name: i.title,
          currency: 'USD',
          price: getAdjustedPrice(i.price, i.id, { promoCode: promo?.appliedCode }) / 100,
          quantity: 1,
        })),
      });
    } catch (e) {
      console.error(e);
    } finally {
      fetch('/api/payment/paypal', {
        method: 'POST',
        body: JSON.stringify({
          items: adjustedItems,
          total: adjustedTotal,
          promoCode: promo?.appliedCode,
        }),
      })
        .then((res) => res.json())
        .then((json) => router.replace(json.url));
    }
  };

  return (
    <form method="POST" onSubmit={submitOrder} className="pt-4 text-center text-bodySmall text-gray-400">
      <button type="submit" disabled={cart.length === 0}>
        or checkout with PayPal
      </button>
    </form>
  );
}
