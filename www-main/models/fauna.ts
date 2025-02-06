import type Stripe from 'stripe';
import { PromoCode } from '../hooks/usePromoCodeInput';

export interface FaunaDocument<DataFields> {
  ref: {
    '@ref': {
      id: string;
    };
    id: string;
  };
  ts: number;
  data: DataFields;
}

export interface FaunaUserCourseData {
  email: string;
  courseId: string;
  enrolled: boolean;
  orderId: string;
  enrolledAt?: string;
}

export interface FaunaUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscribed: boolean;
  stripeCustomerId: string;
  imageUrl: string;
  nickname: string;
  auth0Subs: string[];
  role: 'user' | 'instructor';
  emailVerified: boolean;
  community?: boolean;
  subBetaEnroll?: boolean;
}

export interface Auth0User {
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  updated_at: string; //??? timestamp
  email: string;
  email_verified: boolean;
  sub: string;
}

export interface FaunaGiftedCourseData {
  recipientEmail: string;
  giverEmail: string;
  courseId: string;
  claimed: boolean;
  orderId: string;
}

export interface FaunaCourseProgressData {
  userEmail: string;
  courseId: string;
  completedLessons: string[];
  bookmarkedLessons: string[];
  videoProgress: Record<string, number>;
}

export interface FaunaCourseMigrationData {
  email: string;
  courseIds?: string[];
  profileImageUrl?: string;
  migrated: boolean;
}

export interface FaunaOrderCourse {
  id: string;
  price: number;
  creator: string;
  isPreorder: boolean;
}

export interface FaunaOrderData {
  email: string;
  items?: FaunaOrderCourse[];
  total: number;
  paymentMethod: 'stripe' | 'paypal' | 'redemption-code' | 'manual-gift';
  paymentId?: string;
  type: 'purchase' | 'gift' | 'subscription' | 'redemption-code';
  source?: FaunaOrderSource;
  promoCode?: PromoCode | string;
  subscription?: string;
  billingInterval?: Stripe.Price.Recurring.Interval;
  orderedAt?: string;
}

export interface FaunaOrderSource {
  utm_source: string | string[] | undefined;
  utm_medium: string | string[] | undefined;
  utm_id?: string | string[] | undefined;
  utm_campaign?: string | string[] | undefined;
  utm_term?: string | string[] | undefined;
  utm_content?: string | string[] | undefined;
}

export interface FaunaProductNotification {
  productName: string;
  userEmail: string;
  signedUpAt: string;
}
