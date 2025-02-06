import Mixpanel from 'mixpanel';
import type Stripe from 'stripe';

const mixpanel = Mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN ?? '', {
  protocol: 'https',
});

export function track(eventType: Event.ServerCoursePurchase, data: ServerCoursePurchaseData): void;
export function track(eventType: Event.ServerSubscriptionPurchase, data: ServerSubscriptionPurchaseData): void;
export function track(eventType: Event, data: ServerCoursePurchaseData | ServerSubscriptionPurchaseData): void {
  if (process.env.NEXT_PUBLIC_APPLICATION_ENV === 'production') {
    mixpanel.track(eventType, data);
  } else {
    console.log(`Mixpanel event would've fired in production: ${eventType}`, JSON.stringify(data));
  }
}

export enum Event {
  ServerCoursePurchase = 'ServerCoursePurchase',
  ServerSubscriptionPurchase = 'ServerSubscriptionPurchase',
}

export interface ServerCoursePurchaseData {
  courseId: string;
  courseTitle: string;
  creatorId: string;
  creatorName: string;
  price: number;
  isPreorder: boolean;
  promoCode?: string;
}

export interface ServerSubscriptionPurchaseData {
  billingInterval: Stripe.Price.Recurring.Interval;
  price: number;
  promoCode?: string;
}
