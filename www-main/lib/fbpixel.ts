import { BT_CONSOLE_COLORS } from '../utils/constants';

type fbData = AddToCartData | InitiateCheckoutData | PurchaseData | ViewContentData | SubscribeData;

declare global {
  interface Window {
    fbq: (action: Action, event: StandardEvent, data?: fbData) => void;
  }
}

export function event(action: Action, event: StandardEvent.AddToCart, data: AddToCartData): void;
export function event(action: Action, event: StandardEvent.InitiateCheckout, data: InitiateCheckoutData): void;
export function event(action: Action, event: StandardEvent.Purchase, data: PurchaseData): void;
export function event(action: Action, event: StandardEvent.ViewContent, data: ViewContentData): void;
export function event(action: Action, event: StandardEvent.Subscribe, data: SubscribeData): void;
export function event(action: Action, event: StandardEvent.PageView): void;
export function event(action: Action, event: StandardEvent, data?: fbData): void {
  if (process.env.NEXT_PUBLIC_APPLICATION_ENV === 'production') {
    window.fbq(action, event, data);
  } else {
    console.groupCollapsed(
      `%cFacebook event would've fired in production: ${event} (expand for fields)`,
      ['background: #3976EB', 'color: white', ...BT_CONSOLE_COLORS].join(';')
    );
    console.log(JSON.stringify(data, null, 2));
    console.groupEnd();
  }
}

export enum Action {
  track = 'track',
}

// Facebook Pixel Standard Events
// https://www.facebook.com/business/help/402791146561655?id=1205376682832142
export enum StandardEvent {
  AddToCart = 'AddToCart',
  InitiateCheckout = 'InitiateCheckout',
  Purchase = 'Purchase',
  ViewContent = 'ViewContent',
  PageView = 'PageView',
  Subscribe = 'Subscribe',
}

type ContentType = 'course' | 'subscription';
type Currency = 'USD';

interface Course {
  id: string;
  quantity: number;
}

export interface AddToCartData {
  content_id: string;
  item_price: number;
  currency: Currency;
  value: number;
}

export interface InitiateCheckoutData {
  content_category: string;
  content_ids: string[];
  contents: Course[];
  currency: Currency;
  num_items: number;
  value: number;
}

export interface PurchaseData {
  content_ids: string[];
  content_name: string;
  content_type: ContentType;
  contents: Course[];
  currency: Currency;
  num_items: number;
  value: number;
}

export interface ViewContentData {
  content_ids: string[];
  content_type: ContentType;
  content_category: string[];
  value: number;
  currency: Currency;
}

export interface SubscribeData {
  value: number;
  currency: Currency;
  predicted_ltv: number;
}
