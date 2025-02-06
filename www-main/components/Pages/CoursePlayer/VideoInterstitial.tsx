import Image from 'next/image';
import Link from 'next/link';
import { useProductNotification } from 'hooks/useProductNotification';
import { Course } from 'models/contentful';
import btLogoImage from 'public/images/logo.png';
import { BlockerMap } from './VideoBlocker';
import Button from 'components/Button';

export const VideoInterstitial = ({
  course,
  nextLessonId,
  blockers,
}: {
  course: Course;
  nextLessonId: string | undefined;
  blockers: BlockerMap['videos'];
}) => {
  const { notifyModal, openModal } = useProductNotification(
    `Stay updated about our ${course.fields.title} project`,
    course.fields.title
  );

  let ctaHref = `/api/auth/login?returnTo=${encodeURIComponent(
    `/api/free-enroll?courseId=${course.sys.id}${nextLessonId ? '&v=' + nextLessonId : ''}`
  )}`;
  let ctaText = 'Create a free Bright Trip account to continue watching';
  let ctaButtonText = 'Sign up for FREE';
  let altCtaText = 'Already have an account?';
  let altCtaHref = `/api/auth/login?returnTo=${encodeURIComponent(
    `/api/free-enroll?courseId=${course.sys.id}${nextLessonId ? '&v=' + nextLessonId : ''}`
  )}`;

  if (blockers?.type === 'subscription') {
    ctaText = "The next video is only available to Bright Trip subscribers. You'll need to subscribe to keep watching.";
    ctaButtonText = 'Subscribe';
    ctaHref = '/subscription?term=annual';
    altCtaText = 'Already subscribed?';
    altCtaHref = `/api/auth/login?returnTo=${encodeURIComponent(
      `/my-courses/${course.fields.slug}${nextLessonId ? '?v=' + nextLessonId : ''}`
    )}`;
  } else if (blockers?.type === 'purchase') {
    ctaText = "The next video is only available to owners of this course. You'll need to purchase it to keep watching.";
    ctaButtonText = 'Buy Now';
    ctaHref = `/api/auth/login?returnTo=${encodeURIComponent(`/api/payment/checkout-session?cid=${course.sys.id}`)}`;
    altCtaText = 'Already own this course?';
    altCtaHref = `/api/auth/login?returnTo=${encodeURIComponent(
      `/my-courses/${course.fields.slug}${nextLessonId ? '?v=' + nextLessonId : ''}`
    )}`;
  } else if (blockers?.type === 'unreleased') {
    ctaText = blockers.message;
    ctaButtonText = 'Notify Me';
  }

  const buttonStyles = `my-6 text-md`;

  return (
    <div className="rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-xl shadow-xl backdrop-saturate-150 p-6 py-10 flex flex-col items-center w-full relative">
      <Image className="filter invert" src={btLogoImage} alt="Bright Trip Logo" height="60" width="246" />
      <p className="text-white text-body text-center font-bodycopy max-w-xs mt-4">{ctaText}</p>
      {blockers?.type === 'unreleased' || true ? (
        <>
          <Button variant="glassPrimary" onClick={openModal} className={buttonStyles}>
            {ctaButtonText}
          </Button>
          {notifyModal}
        </>
      ) : (
        <>
          <Link href={ctaHref}>
            <Button variant="glassPrimary" className={buttonStyles}>
              {ctaButtonText}
            </Button>
          </Link>
          <p className="text-white text-caption font-bodycopy hover:decoration-bt-teal">
            {altCtaText}
            {'  '}
            <Link href={altCtaHref} className="underline">
              Sign In
            </Link>
          </p>
        </>
      )}
    </div>
  );
};
