import { ShoppingCartIcon } from '@heroicons/react/outline';
import { MailIcon, PlayIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { Suspense, useState } from 'react';
import appConfig from '../appConfig';
import { useCartContext } from '../hooks/useCartContext';
import { useProductNotification } from '../hooks/useProductNotification';
import { useUserDataContext } from '../hooks/useUserDataContext';
import * as mpClient from '../mixpanel/client';
import { ButtonLocation } from '../mixpanel/client';
import { Course } from '../models/contentful';
import { toUsd } from '../utils';
import { isFutureCourse } from '../utils/dates';
import { handleFreeEnrollment, handleSubscriptionEnrollment } from '../utils/enrollment';
import { getAdjustedPrice } from '../utils/sales';
import { createCourseThumbnailURL, createCourseURL } from '../utils/ui-helpers';
import Button, { ButtonProps } from './Button';
import Spinner from './Spinner';

interface CourseCTAButtonProps {
  course: Course;
  buttonLocation: ButtonLocation;
  buttonProps?: ButtonProps;
  withPrice?: boolean;
}

export default function CourseCTAButton({
  course,
  buttonLocation,
  buttonProps,
  withPrice = false,
}: CourseCTAButtonProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);
  const { user, enrolledCourses } = useUserDataContext();
  const { addItemToCart, openCart, promo, isCourseInCart } = useCartContext();
  const router = useRouter();
  const { openModal, notifyModal } = useProductNotification(
    `Get notified when ${course.fields.title} goes live`,
    course.fields.title
  );

  const enrolledCourseIds = enrolledCourses.map((c) => c.sys.id);
  const userIsAlreadyEnrolled = enrolledCourseIds.includes(course.sys.id);
  const courseIsInSubscription = appConfig.subscriptionCourses.includes(course?.sys.id);
  const courseIsFree =
    getAdjustedPrice(course.fields.price ?? 0, course.sys.id, { promoCode: promo?.appliedCode }) === 0;

  const getBuyButtonContent = () => {
    const startAvailableCourseText = 'Watch Now';
    if (!course) return { text: '', icon: <></>, onClick: () => null };

    if (isEnrolling) {
      return { text: 'Enrolling', icon: <Spinner />, onClick: () => null };
    }

    if (userIsAlreadyEnrolled) {
      return {
        text: isFutureCourse(course) ? 'Get Notified' : 'Continue',
        icon: isFutureCourse(course) ? <MailIcon /> : <PlayIcon />,
        onClick: () => {
          if (isFutureCourse(course)) {
            openModal();
          } else {
            return router.push(createCourseURL(course, enrolledCourseIds));
          }
        },
      };
    }

    if (courseIsFree) {
      return {
        text: isFutureCourse(course) ? 'Pre-Enroll' : startAvailableCourseText,
        icon: <PlayIcon />,
        onClick: () => {
          mpClient.track(mpClient.Event.StartAvailableCourseIntent, {
            courseId: course.sys.id,
            courseTitle: course.fields.title,
            loggedIn: Boolean(user),
            buttonLocation,
            type: 'free',
          });

          if (!user) {
            return router.push(`/my-courses/${course.fields.slug}`);
          }
          return handleFreeEnrollment(
            user,
            course,
            router,
            buttonLocation,
            () => setIsEnrolling(true),
            () => setIsEnrolling(false)
          );
        },
      };
    }

    if (courseIsInSubscription) {
      if (user?.subscribed) {
        return {
          text: isFutureCourse(course) ? 'Pre-Enroll' : startAvailableCourseText,
          icon: <PlayIcon />,
          onClick: () => {
            mpClient.track(mpClient.Event.StartAvailableCourseIntent, {
              courseId: course.sys.id,
              courseTitle: course.fields.title,
              loggedIn: Boolean(user),
              buttonLocation,
              type: 'subscription',
            });

            return handleSubscriptionEnrollment(
              user,
              course,
              router,
              buttonLocation,
              () => setIsEnrolling(true),
              () => setIsEnrolling(false)
            );
          },
        };
      }
    }

    const textBase = isFutureCourse(course) ? 'Pre-Order' : 'Buy';
    const salePrice = getAdjustedPrice(course.fields.price ?? 0, course.sys.id, { promoCode: promo?.appliedCode });
    const textSuffix = withPrice ? `for ${toUsd(salePrice)}` : 'Now';
    const finalText = `${textBase} ${textSuffix}`;

    return {
      text: isCourseInCart(course.sys.id) ? 'In Cart' : finalText,
      icon: <ShoppingCartIcon />,
      onClick: () => {
        if (!isCourseInCart(course.sys.id)) {
          addItemToCart(
            {
              id: course.sys.id,
              title: course.fields.title,
              creatorName: course.fields.creator?.fields.name ?? '',
              price: course.fields.price ?? 0,
              imgUrl: createCourseThumbnailURL(course),
              slug: course.fields.slug,
            },
            buttonLocation
          );
        }
        // @ts-expect-error intentionally not passing this event because we don't want to use it
        buttonProps?.onClick?.();
        // This is a dirty hack around https://github.com/tailwindlabs/headlessui/issues/1744
        // we can and should remove this timeout when/if that's ever fixed
        setTimeout(() => {
          openCart();
        }, 500);
      },
      content: null,
      // content: (
      //     <StripeCourseBuyNowButton buttonProps={buttonProps} course={course}>
      //         {isFutureCourse(course) ? 'Pre-Order Now' : 'Buy Now'}
      //     </StripeCourseBuyNowButton>
      // ),
    };
  };

  const { text, icon, onClick, content } = getBuyButtonContent();

  if (content) return content;

  return (
    <>
      <Button {...buttonProps} onClick={onClick} icon={icon}>
        <Suspense fallback="—">{text}</Suspense>
      </Button>
      {isFutureCourse(course) ? notifyModal : null}
    </>
  );
}
