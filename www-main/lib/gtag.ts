import { BT_CONSOLE_COLORS } from '../utils/constants';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

type gaData =
  | AddToCartData
  | BeginCheckoutData
  | LoginData
  | PurchaseData
  | RemoveFromCartData
  | ShareData
  | SignUpData
  | ViewCartData
  | ViewItemData;

declare global {
  interface Window {
    gtag: (type: string, section: Action | string, data: Record<string, string> | gaData) => void;
  }
}

export const pageview = (url: string) => {
  window.gtag('config', 'G-JTPD402CWK', {
    page_path: url,
  });
};

export function event(action: Action.AddToCart, data: AddToCartData): void;
export function event(action: Action.BeginCheckout, data: BeginCheckoutData): void;
export function event(action: Action.Login, data: LoginData): void;
export function event(action: Action.Purchase, data: PurchaseData): void;
export function event(action: Action.RemoveFromCart, data: RemoveFromCartData): void;
export function event(action: Action.Share, data: ShareData): void;
export function event(action: Action.SignUp, data: SignUpData): void;
export function event(action: Action.ViewCart, data: ViewCartData): void;
export function event(action: Action.ViewItem, data: ViewItemData): void;

export function event(action: Action, data: gaData): void {
  if (process.env.NEXT_PUBLIC_APPLICATION_ENV === 'production') {
    window.gtag('event', action, data);
  } else {
    console.groupCollapsed(
      `%cGoogle Analytics event would've fired in production: ${action} (expand for fields)`,
      ['background: #EEAE3C', 'color: black', ...BT_CONSOLE_COLORS].join(';')
    );
    console.log(JSON.stringify(data, null, 2));
    console.groupEnd();
  }
}

// https://developers.google.com/analytics/devguides/collection/ga4/reference/events

export enum Action {
  AddToCart = 'add_to_cart',
  BeginCheckout = 'begin_checkout',
  Login = 'login',
  Purchase = 'purchase',
  RemoveFromCart = 'remove_from_cart',
  Share = 'share',
  SignUp = 'sign_up',
  ViewCart = 'view_cart',
  ViewItem = 'view_item',
}

type Currency = 'USD';
type AuthMethod = 'auth0';

interface Item {
  item_id: string;
  item_name: string;
  currency?: Currency;
  price?: number;
  quantity?: number;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string; // 5 is the GA limit
}

interface AddToCartData {
  currency: Currency;
  value: number;
  items: Item[];
}

interface BeginCheckoutData {
  currency: Currency;
  value: number;
  coupon?: string;
  items: Item[];
}

interface LoginData {
  method: AuthMethod;
}

interface PurchaseData {
  currency: Currency;
  transaction_id: string;
  value: number;
  coupon?: string;
  items: Item[];
}

interface RemoveFromCartData {
  currency: Currency;
  value: number;
  items: Item[];
}

interface ShareData {
  method: string;
  content_type: string;
  item_id: string;
}

interface SignUpData {
  method: AuthMethod;
}

interface ViewCartData {
  currency: Currency;
  value: number;
  items: Item[];
}

interface ViewItemData {
  currency: Currency;
  value: number;
  items: Item[];
}
