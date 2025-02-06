'use client';

import { useBrightTripUser } from '../hooks/useBrightTripUser';
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import usePromoCodeInput from '../hooks/usePromoCodeInput';
import * as fbpixel from '../lib/fbpixel';
import * as gtag from '../lib/gtag';
import * as mpClient from '../mixpanel/client';
import { ButtonLocation } from '../mixpanel/client';
import { getAdjustedPrice } from '../utils/sales';

export interface CartContextType {
  cart: CartCourse[];
  addItemToCart: (addedCourse: CartCourse, buttonLocation: ButtonLocation) => void;
  removeItemFromCart: (removedCourse: CartCourse) => void;
  clearCart: () => void;
  isCourseInCart: (courseId: string) => boolean;
  cartIsOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
  subtotal: number;
  total: number;
  promo: ReturnType<typeof usePromoCodeInput> | undefined;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export type CartCourse = {
  id: string;
  title: string;
  creatorName: string;
  price: number;
  imgUrl: string;
  slug: string;
};

const CartProvider = ({ children }: { children?: ReactNode }) => {
  const [cart, setCart] = useState<CartCourse[]>(() =>
    // localStorage doesn't exist when server-side rendering, so we need to check
    JSON.parse(typeof localStorage !== 'undefined' ? localStorage?.getItem('brighttrip_cart') ?? '[]' : '[]')
  );
  const { user } = useBrightTripUser();

  const [cartIsOpen, setCartIsOpen] = useState(false);

  const promo = usePromoCodeInput(cart.map((cartItem) => cartItem.id));

  useEffect(() => {
    localStorage.setItem('brighttrip_cart', JSON.stringify(cart));
  }, [cart]);

  const addItemToCart = useCallback((addedCourse: CartCourse, buttonLocation: ButtonLocation) => {
    if (isCourseInCart(addedCourse.id)) return;
    setCart((prev) => [addedCourse, ...prev]);

    try {
      if (user) {
        fetch('/api/users/cart', { method: 'POST', body: JSON.stringify({ courseIds: [addedCourse.id] }) });
      }

      fbpixel.event(fbpixel.Action.track, fbpixel.StandardEvent.AddToCart, {
        content_id: addedCourse.id,
        item_price: addedCourse.price / 100,
        currency: 'USD',
        value: addedCourse.price / 100,
      });

      mpClient.track(mpClient.Event.AddToCart, {
        courseId: addedCourse.id,
        courseTitle: addedCourse.title,
        creatorName: addedCourse.creatorName,
        price: addedCourse.price,
        buttonLocation,
      });

      gtag.event(gtag.Action.AddToCart, {
        currency: 'USD',
        value: addedCourse.price / 100,
        items: [
          {
            item_id: addedCourse.id,
            item_name: addedCourse.title,
            currency: 'USD',
            price: addedCourse.price / 100,
            quantity: 1,
          },
        ],
      });

      window.gtag('event', 'conversion', {
        send_to: 'AW-734177645/6BSGCKbHnK4DEO3Sit4C',
        value: addedCourse.price / 100,
        currency: 'USD',
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const removeItemFromCart = useCallback((removedCourse: CartCourse) => {
    setCart((prev) => prev.filter((i) => i.id !== removedCourse.id));
    try {
      if (user) {
        fetch('/api/users/cart', { method: 'DELETE', body: JSON.stringify({ courseId: removedCourse.id }) });
      }

      mpClient.track(mpClient.Event.RemoveFromCart, {
        courseId: removedCourse.title,
        price: removedCourse.price,
      });
      gtag.event(gtag.Action.RemoveFromCart, {
        currency: 'USD',
        value: removedCourse.price / 100,
        items: [
          {
            item_id: removedCourse.id,
            item_name: removedCourse.title,
            currency: 'USD',
            price: removedCourse.price / 100,
            quantity: 1,
          },
        ],
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const isCourseInCart = useCallback((courseId: string) => cart.map((item) => item.id).includes(courseId), [cart]);

  const toggleCart = useCallback(() => setCartIsOpen((prev) => !prev), []);

  const closeCart = useCallback(() => setCartIsOpen(false), []);

  const openCart = useCallback(() => setCartIsOpen(true), []);

  const subtotal = cart.reduce((sum, { price }) => sum + price, 0);

  // add to total ??
  const total = cart.reduce(
    (sum, { price, id }) => sum + getAdjustedPrice(price, id, { promoCode: promo.appliedCode }),
    0
  );

  const providerValue = useMemo(
    () => ({
      cart,
      addItemToCart,
      removeItemFromCart,
      isCourseInCart,
      cartIsOpen,
      toggleCart,
      closeCart,
      openCart,
      subtotal,
      total,
      clearCart,
      promo,
    }),
    [
      cart,
      addItemToCart,
      removeItemFromCart,
      isCourseInCart,
      cartIsOpen,
      toggleCart,
      closeCart,
      subtotal,
      total,
      openCart,
      clearCart,
      promo,
    ]
  );

  return <CartContext.Provider value={providerValue}>{children}</CartContext.Provider>;
};

export default CartProvider;
