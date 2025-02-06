import { NextRouter } from 'next/router';
import * as mpClient from '../mixpanel/client';
import { Course } from '../models/contentful';
import { FaunaUserData } from '../models/fauna';
import { isFutureCourse } from './dates';

export const SYSTEM_ORDER_IDS = {
  FREE: 'free',
  GIFT: 'gift',
  MIGRATION: 'migration',
  ADMIN_ENROLL: 'admin-enroll',
  SUBSCRIPTION: 'subscription',
  PLAYLIST: 'playlist',
  SINGLE_VIDEO_FREE: 'single-video-free',
  REPUBLIC_CAMPAIGN_PERK: 'republic-campaign-perk',
} as const;

type ValueOf<T> = T[keyof T];
type SystemEnrollmentType = ValueOf<typeof SYSTEM_ORDER_IDS>;
export type EnrollmentType = SystemEnrollmentType | 'purchase';

export const handleSubscriptionEnrollment = (
  user: FaunaUserData | undefined,
  course: Course,
  router: NextRouter,
  buttonLocation: mpClient.ButtonLocation,
  onStart?: () => void,
  onSuccess?: () => void,
  onError?: () => void
) => {
  if (!user) {
    router.push(`/api/auth/login`);
  }

  if (!course) return;

  onStart?.();

  try {
    mpClient.track(mpClient.Event.Enrollment, {
      courseId: course.sys.id,
      courseTitle: course.fields.title,
      creatorId: course.fields.creator?.sys.id ?? 'Unknown Creator ID',
      creatorName: course.fields.creator?.fields.name ?? 'Unknown Creator Name',
      courseCategory: course.fields.category.map((c) => c.fields.name),
      type: 'subscription',
      buttonLocation,
    });
  } catch (e) {
  } finally {
    fetch('/api/subscription/enroll', {
      method: 'POST',
      body: JSON.stringify({ courseId: course.sys.id }),
    })
      .then((res) => {
        if (res.status === 200 && res.ok) {
          onSuccess?.();
          router.push(`/my-courses/${course.fields.slug}`);
        } else {
          throw new Error('Failed to enroll user in course');
        }
      })
      .catch((error) => {
        console.error(error);
        onError?.();
      });
  }
};

export const handleFreeEnrollment = (
  user: FaunaUserData | undefined,
  course: Course | undefined,
  router: NextRouter,
  buttonLocation: mpClient.ButtonLocation,
  onStart?: () => void,
  onError?: () => void,
  destinationLessonId?: string
) => {
  if (!user) {
    router.push(`/api/auth/login`);
  }

  if (!course) return;

  onStart?.();

  try {
    mpClient.track(mpClient.Event.Enrollment, {
      courseId: course.sys.id,
      courseTitle: course.fields.title,
      creatorId: course.fields.creator?.sys.id ?? 'Unknown Creator ID',
      creatorName: course.fields.creator?.fields.name ?? 'Unknown Creator Name',
      courseCategory: course.fields.category.map((c) => c.fields.name),
      type: 'free',
      buttonLocation,
    });
  } catch (e) {
  } finally {
    fetch('/api/free-enroll', {
      method: 'POST',
      body: JSON.stringify({ courseId: course.sys.id }),
    })
      .then((res) => {
        if (res.status === 200 && res.ok) {
          if (isFutureCourse(course)) {
            router.push(`/my-courses`);
          } else {
            router.push(`/my-courses/${course.fields.slug}${destinationLessonId ? `?v=${destinationLessonId}` : ''}`);
          }
        } else {
          throw new Error('Failed to enroll user in course');
        }
      })
      .catch((error) => {
        console.error(error);
        onError?.();
      });
  }
};
