'use client';

import { Dialog, Transition } from '@headlessui/react';
import { ShoppingCartIcon, TrashIcon, XIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import { Fragment, useEffect, useRef } from 'react';

import Text from './Text';

import Image from 'next/image';
import appConfig from '../appConfig';
import { useCartContext } from '../hooks/useCartContext';
import { useUserDataContext } from '../hooks/useUserDataContext';
import * as gtag from '../lib/gtag';
import { toUsd } from '../utils';
import Button from './Button';
import CoursePrice from './CoursePrice';
import PaypalCheckoutButton from './PaypalCheckoutButton';
import StripeCheckoutButton from './StripeCheckoutButton';
import { contentfulImageLoader } from '../utils/contentfulImageLoader';
import { useRouter } from 'next/router';

export default function CartSidebar() {
  const { cart, cartIsOpen, closeCart, openCart, removeItemFromCart, total, subtotal, promo } = useCartContext();
  const { user } = useUserDataContext();
  const { query: { cart: cartParam } = {} } = useRouter();
  const manuallyClosed = useRef(false);

  useEffect(() => {
    if (cartParam === 'show' && !cartIsOpen && !manuallyClosed.current) {
      openCart();
    }
  }, [cartParam, cartIsOpen, openCart]);

  useEffect(() => {
    if (cartIsOpen) {
      try {
        gtag.event(gtag.Action.ViewCart, {
          currency: 'USD',
          value: total / 100,
          items: cart.map((i) => ({
            item_id: i.id,
            item_name: i.title,
            currency: 'USD',
            price: i.price / 100,
            quantity: 1,
          })),
        });
      } catch (e) {
        console.error(e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartIsOpen]);

  const handleCloseCart = () => {
    manuallyClosed.current = true;
    closeCart();
  };

  return (
    <Transition.Root show={cartIsOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-30 overflow-hidden" onClose={handleCloseCart}>
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0" />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-sm">
                <div className="flex h-full flex-col bg-bt-background-light shadow-xl dark:bg-gray-800">
                  <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-6">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between border-b border-gray-200 pb-4 dark:border-gray-600">
                        <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-gray-300">
                          <span className="text-2xl ">Cart</span>
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="focus:outline-none rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-bt-teal dark:bg-gray-700 dark:hover:text-gray-200"
                            onClick={handleCloseCart}
                          >
                            <span className="sr-only">Close Cart</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-2.5 flex-1 divide-y divide-gray-200 px-4 sm:px-6">
                      {cart.length > 0 ? (
                        cart.map((cartItem) => (
                          <div
                            key={cartItem.id}
                            className="grid gap-2 py-6 items-start"
                            style={{ gridTemplateColumns: '64px 1fr auto' }}
                          >
                            <Image
                              src={cartItem.imgUrl}
                              alt={cartItem.title}
                              width="64"
                              height="64"
                              className="h-16 w-16 object-cover rounded-md shadow-lg"
                              loader={contentfulImageLoader}
                            />
                            <div className="ml-2">
                              <Link href={cartItem.slug}>
                                <p className="text-body font-bold leading-snug dark:text-gray-300">{cartItem.title}</p>
                              </Link>
                              <p className="mt-0.5 text-bodySmall leading-tight font-bodycopy text-bt-teal dark:text-bt-teal-light">
                                with {cartItem.creatorName}
                              </p>
                            </div>
                            <div className="flex flex-col items-end justify-between h-full pb-2 pl-1 dark:text-gray-300">
                              <CoursePrice courseId={cartItem.id} price={cartItem.price} variant="body" />
                              <button onClick={() => removeItemFromCart(cartItem)}>
                                <TrashIcon className="h-5 w-5 text-gray-500 dark:text-gray-500" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="block text-body font-bodycopy text-black/50 text-center mt-20 dark:text-white/50">
                          You don&apos;t have any items in your cart
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-4 mb-4">
                    <div className="flex flex-col space-y-1 px-2 dark:text-gray-300">
                      <div className="flex justify-end font-bodycopy">{promo?.PromoCodeLinkInput}</div>
                      {(appConfig.sale.isActive && appConfig.sale.percentageDiscount > 0) ||
                      promo?.isPromoCodeApplied ? (
                        <>
                          <div className="text-md flex justify-between border-t border-gray-200 dark:border-gray-600 py-4 font-bold text-gray-600 dark:text-gray-400">
                            <p className="text-body">Sub-Total</p>
                            <p className="text-body">{toUsd(subtotal, true)}</p>
                          </div>

                          <div className="pb-4">
                            <div className="text-md flex justify-between border-t pt-4 border-gray-200 dark:border-gray-600 font-bold text-gray-600 dark:text-gray-400">
                              <p className="text-body">Adjustments</p>
                              <p className="text-body">-{toUsd(subtotal - total, true)}</p>
                            </div>
                            <div className="flex flex-col justify-center gap-2 pt-2">
                              {appConfig.sale.isActive && appConfig.sale.percentageDiscount > 0 ? (
                                <div className="flex gap-3 rounded-lg bg-bt-teal-ultraLight/20 px-3 py-1">
                                  <p className="text-bodySmall text-bt-orange dark:text-bt-orange-ultraLight">
                                    Site-wide {appConfig.sale.percentageDiscount}
                                    %-off sale
                                  </p>
                                </div>
                              ) : null}
                              {Boolean(promo?.isPromoCodeApplied) && <div>{promo?.PromoCodeDescription}</div>}
                            </div>
                          </div>
                        </>
                      ) : null}
                      <div className="text-md flex justify-between border-t border-gray-200 dark:border-gray-600 py-4 font-bold text-gray-800 dark:text-gray-300">
                        <p className="text-subtitle1 font-bold">Total</p>
                        <div className="flex items-center gap-2">
                          {promo?.isPromoCodeApplied && promo.PromoCodeIcon}
                          <p className="text-subtitle1">{toUsd(total, true)}</p>
                        </div>
                      </div>
                    </div>
                    {user?.email ? (
                      <>
                        <StripeCheckoutButton
                          className="w-full rounded-full shadow-none drop-shadow-none"
                          icon={<ShoppingCartIcon />}
                        />
                        <PaypalCheckoutButton />
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-4 p-2 pt-5 pb-6 bg-bt-teal-ultraLight/20 rounded-xl">
                        <Text variant="body">You need to be signed in to checkout</Text>
                        <AuthLink />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

const AuthLink = () => {
  const url = new URL(window.location.href);
  url.searchParams.set('cart', 'show');

  return (
    <Link href={`/api/auth/login?returnTo=${encodeURIComponent(url.toString())}`}>
      <Button className="px-7">Sign Up or Log In</Button>
    </Link>
  );
};
