'use client';

import mixpanel from 'mixpanel-browser';
import type Stripe from 'stripe';

import { CartCourse } from '../context/cart';
import { PromoCode } from '../hooks/usePromoCodeInput';
import { ContentfulCourseResourceFieldsType } from '../models/contentful';
import { BT_CONSOLE_COLORS } from '../utils/constants';
import { EnrollmentType } from '../utils/enrollment';

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN ?? '', {
  debug: process.env.NEXT_PUBLIC_APPLICATION_ENV !== 'production',
});

export function track(eventType: Event.Pageview, data: PageviewData): void;
export function track(eventType: Event.AddToCart, data: AddToCartData): void;
export function track(eventType: Event.Enrollment, data: EnrollmentData): void;
export function track(eventType: Event.RemoveFromCart, data: RemoveFromCartData): void;
export function track(eventType: Event.GoToCheckout, data: GoToCheckoutData): void;
export function track(eventType: Event.CheckoutWithPaypal, data: CheckoutwithPaypalData): void;
export function track(eventType: Event.Checkout, data: CheckoutData): void;
export function track(eventType: Event.ProceedtoGiftCheckout, data: ProceedToGiftCheckoutData): void;
export function track(eventType: Event.Order, data: OrderData): void;
export function track(eventType: Event.NewsletterSignUp, data: NewsletterSignUpData): void;
export function track(eventType: Event.Share, data: ShareData): void;
export function track(eventType: Event.CopyLink, data: CopyLinkData): void;
export function track(eventType: Event.Bookmark, data: BookmarkData): void;
export function track(eventType: Event.CourseResource, data: CourseResourceData): void;
export function track(eventType: Event.CoursePurchase, data: CoursePurchaseData): void;
export function track(eventType: Event.SignUp, data: SignUpData): void;
export function track(eventType: Event.SignIn, data: SignInData): void;
export function track(eventType: Event.PlayTrailer, data: PlayTrailerData): void;
export function track(eventType: Event.PlaySample, data: PlaySampleData): void;
export function track(eventType: Event.ProductView, data: ProductViewData): void;
export function track(eventType: Event.LessonPlay, data: LessonPlayData): void;
export function track(eventType: Event.LessonComplete, data: LessonCompleteData): void;
export function track(eventType: Event.CourseStart, data: CourseStartData): void;
export function track(eventType: Event.Cohort, data: CohortData): void;
export function track(eventType: Event.SubscriptionPurchase, data: SubscriptionPurchaseData): void;
export function track(eventType: Event.SubscriptionPriceView, data: SubscriptionPriceViewData): void;
export function track(eventType: Event.PlaylistVideoPlay, data: PlaylistVideoPlayData): void;
export function track(eventType: Event.PlaylistVideoComplete, data: PlaylistVideoCompleteData): void;
export function track(eventType: Event.ExternalTrafficSent, data: ExternalTrafficSentData): void;
export function track(eventType: Event.StartAvailableCourseIntent, data: StartAvailableCourseIntentData): void;
export function track(
  eventType: Event,
  data:
    | PageviewData
    | AddToCartData
    | EnrollmentData
    | RemoveFromCartData
    | GoToCheckoutData
    | CheckoutwithPaypalData
    | CheckoutData
    | ProceedToGiftCheckoutData
    | OrderData
    | NewsletterSignUpData
    | ShareData
    | CopyLinkData
    | BookmarkData
    | CourseResourceData
    | CoursePurchaseData
    | SignUpData
    | SignInData
    | PlayTrailerData
    | PlaySampleData
    | ProductViewData
    | LessonPlayData
    | LessonCompleteData
    | CourseStartData
    | CohortData
    | SubscriptionPurchaseData
    | SubscriptionPriceViewData
    | PlaylistVideoPlayData
    | ExternalTrafficSentData
) {
  if (process.env.NEXT_PUBLIC_APPLICATION_ENV === 'production') {
    mixpanel.track(eventType, data);
  } else {
    console.groupCollapsed(
      `%cMixpanel event would've fired in production: ${eventType} (expand for fields)`,
      ['background: #4f44e0', 'color: white', ...BT_CONSOLE_COLORS].join(';')
    );
    console.log(JSON.stringify(data, null, 2));
    console.groupEnd();
  }
}

export enum Event {
  Pageview = 'Pageview',
  AddToCart = 'AddToCart',
  Enrollment = 'Enrollment',
  RemoveFromCart = 'RemoveFromCart',
  GoToCheckout = 'GoToCheckout',
  CheckoutWithPaypal = 'CheckoutWithPaypal',
  Checkout = 'Checkout',
  ProceedtoGiftCheckout = 'ProceedtoGiftCheckout',
  Order = 'Order',
  NewsletterSignUp = 'NewsletterSignUp',
  Share = 'Share',
  CopyLink = 'CopyLink',
  Bookmark = 'Bookmark',
  CourseGuide = 'CourseGuide',
  CourseResource = 'CourseResource',
  CoursePurchase = 'CoursePurchase',
  SignUp = 'SignUp',
  SignIn = 'SignIn',
  PlayTrailer = 'PlayTrailer',
  PlaySample = 'PlaySample',
  ProductView = 'ProductView',
  LessonPlay = 'LessonPlay',
  LessonComplete = 'LessonComplete',
  CourseStart = 'CourseStart',
  Cohort = 'Cohort',
  SubscriptionPurchase = 'SubscriptionPurchase',
  SubscriptionPriceView = 'SubscriptionPriceView',
  PlaylistVideoPlay = 'PlaylistVideoPlay',
  PlaylistVideoComplete = 'PlaylistVideoComplete',
  ExternalTrafficSent = 'ExternalTrafficSent',
  StartAvailableCourseIntent = 'StartAvailableCourseIntent',
}

type PaymentProvider = 'stripe' | 'paypal' | 'free-redemption';

export interface PageviewData {
  url: string;
}

export type ButtonLocation = 'hero' | 'content' | 'footer' | 'card' | 'url' | 'guide-chapter';

export interface AddToCartData {
  courseId: string;
  courseTitle: string;
  creatorName: string;
  price: number;
  buttonLocation: ButtonLocation;
}

export interface EnrollmentData {
  courseId: string;
  courseTitle: string;
  creatorId: string;
  creatorName: string;
  courseCategory: string[];
  type: 'purchase' | 'free' | 'subscription';
  buttonLocation?: ButtonLocation;
}

export interface RemoveFromCartData {
  courseId: string;
  price: number;
}

export interface GoToCheckoutData {
  cart: CartCourse[];
}

export interface CheckoutwithPaypalData {
  cart: CartCourse[];
}

export interface CheckoutData {
  cart: CartCourse[];
}

export interface ProceedToGiftCheckoutData {
  courseId: string;
}

export interface OrderData {
  cart: CartCourse[];
  paymentProvider: string;
  promoCode?: PromoCode;
}

export interface NewsletterSignUpData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ShareData {
  courseId: string;
}

export interface CopyLinkData {
  courseId: string;
}

export interface BookmarkData {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonName: string;
}

export type CourseResourceDataType = 'guide' | 'map';

export interface CourseResourceData {
  courseId: string;
  courseTitle: string;
  resourceTitle?: string;
  type: CourseResourceDataType | ContentfulCourseResourceFieldsType;
}

export interface CoursePurchaseData {
  courseId: string;
  courseTitle: string;
  creatorId: string;
  creatorName: string;
  courseCategory: string[];
  price: number;
  paymentProvider: PaymentProvider;
  isPreorder: boolean;
}

export type SignUpData = Record<string, never>;

export type SignInData = Record<string, never>;

export interface PlayTrailerData {
  courseId: string;
  courseTitle: string;
  creatorId: string;
  creatorName: string;
}

export interface PlaySampleData {
  name: string;
  courseId: string;
  courseTitle: string;
  creatorId: string;
  creatorName: string;
}

export interface ProductViewData {
  courseId: string;
  courseTitle: string;
  productName: string;
}

export interface LessonPlayData {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  type: EnrollmentType;
}

export interface LessonCompleteData {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  type: EnrollmentType;
}

export interface CourseStartData {
  courseId: string;
  courseTitle: string;
}

export type CohortName = 'multiCoursePurchase' | 'signupLastMonth' | 'fans' | 'learners30';

export interface CohortData {
  name: CohortName;
}

export interface SubscriptionPurchaseData {
  billingInterval: Stripe.Price.Recurring.Interval;
  price: number;
  promoCode?: string;
}

export interface SubscriptionPriceViewData {
  billingInterval: Stripe.Price.Recurring.Interval;
  price: number;
  promoCode?: string;
}

export type PlaylistVideoPlayData = LessonPlayData;
export type PlaylistVideoCompleteData = LessonCompleteData;

export type ExternalTrafficSentData =
  | {
      type: 'DMO';
      partner: 'Jordan';
      product: 'Jordan Pass';
      location: string;
    }
  | {
      type: 'Partner';
      partner: 'ADG';
      product: 'Zion Prints';
      location: string;
    }
  | {
      type: 'other';
      partner: 'other';
      product: 'other';
      location: string;
    };

export interface StartAvailableCourseIntentData {
  courseId: string;
  courseTitle: string;
  loggedIn: boolean;
  buttonLocation: ButtonLocation;
  type: 'free' | 'subscription';
}
