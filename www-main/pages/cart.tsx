import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';
import { TrashIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import appConfig from '../appConfig';
import CoursePrice from '../components/CoursePrice';
import Layout from '../components/Layout';
import PaypalCheckoutButton from '../components/PaypalCheckoutButton';
import StripeCheckoutButton from '../components/StripeCheckoutButton';
import { useCartContext } from '../hooks/useCartContext';
import { toUsd } from '../utils';
import { contentfulImageLoader } from '../utils/contentfulImageLoader';
import { getBaseName } from '../utils/ui-helpers';

export default withPageAuthRequired(function CartPage() {
  const { cart, removeItemFromCart, total, subtotal, promo } = useCartContext();

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get('canceled')) {
      // could do some fancy stuff here if we want
    }
  }, []);

  return (
    <Layout title="Your Cart" description="Bright Trip">
      <h1 className="text-4xl font-bold mt-3 text-center dark:text-gray-300">Your Cart</h1>
      <div className="mx-auto mt-4 max-w-screen-md divide-y dark:divide-gray-600 bg-bt-background-light dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        {cart.length ? (
          <>
            {cart.map((cartItem) => (
              <div key={cartItem.id} className="flex items-center justify-between py-6 px-2">
                <div className="flex items-center gap-x-4">
                  <Image
                    src={cartItem.imgUrl}
                    className="h-20 rounded-md"
                    alt=""
                    width="142"
                    height="80"
                    loader={contentfulImageLoader}
                  />
                  <div>
                    <Link href={`/${getBaseName(cartItem.id)}/${cartItem.slug}`}>
                      <h3 className="text-xl font-bold dark:text-gray-300">{cartItem.title}</h3>
                    </Link>
                    <span className="text-bt-teal font-bodycopy dark:text-bt-teal-light">
                      with {cartItem.creatorName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-x-4">
                  <CoursePrice courseId={cartItem.id} As="h4" variant="body" price={cartItem.price} />
                  <button onClick={() => removeItemFromCart(cartItem)}>
                    <TrashIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
            <div className="space-y-4 py-4 px-2">
              {(appConfig.sale.isActive && appConfig.sale.percentageDiscount > 0) || promo?.isPromoCodeApplied ? (
                <>
                  <div className="flex items-center justify-between">
                    <h4 className="text-body text-gray-500 dark:text-gray-400">Subtotal</h4>
                    <span className="text-body text-gray-600 dark:text-gray-400">{toUsd(subtotal, true)}</span>
                  </div>
                  <div className="flex items-start justify-between md:items-center">
                    <h4 className="text-body text-gray-500 dark:text-gray-400">Adjustments</h4>
                    <div className="flex flex-col items-end justify-start gap-2 md:flex-row md:items-center md:justify-end">
                      {appConfig.sale.isActive && appConfig.sale.percentageDiscount > 0 ? (
                        <div className="flex gap-3 rounded-lg bg-bt-teal-ultraLight/20 px-3 py-1">
                          <p className="text-bodySmall text-bt-orange dark:text-bt-orange-ultraLight">
                            Site-wide {appConfig.sale.percentageDiscount}%-off sale
                          </p>
                        </div>
                      ) : null}
                      {Boolean(promo?.isPromoCodeApplied) && <div>{promo?.PromoCodeDescription}</div>}
                    </div>
                  </div>
                </>
              ) : null}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-headline6 font-bold dark:text-gray-300">Total</h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-headline6 font-bold dark:text-gray-300">{toUsd(total, true)}</span>
                </div>
              </div>
            </div>
            <div className="w-full space-y-0 pt-4">
              <div className="flex justify-end">{promo?.PromoCodeInput}</div>
              <StripeCheckoutButton className="rounded-full px-7" />
              <PaypalCheckoutButton />
            </div>
          </>
        ) : (
          <p className="text-body mt-4 font-bodycopy text-black/50 dark:text-white/50 mb-8 text-center">
            You don&apos;t have any items in your cart
          </p>
        )}
      </div>
    </Layout>
  );
});
