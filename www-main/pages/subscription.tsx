import { Asset } from 'contentful';
import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { forwardRef, Ref, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import type Stripe from 'stripe';
import appConfig from '../appConfig';
import Button from '../components/Button';
import Card from '../components/Card';
import CourseCard from '../components/Card/CourseCard';
import ContinueWatching from '../components/ContinueWatching';
import CourseCTAButton from '../components/CourseCTAButton';
import Layout, { MusicbedBanner } from '../components/Layout';
import Modal from '../components/Modal';
import FullWidthSection from '../components/PageSections/FullWidthSection';
import SubscriptionPricing from '../components/SubscriptionPricing';
import Text from '../components/Text';
import contentfulClient from '../contentful/contentfulClient';
import courseNamesMap from '../courseNames';
import creatorNamesMap from '../creatorNames';
import useCourseFilterSearch from '../hooks/useCourseFilterSearch';
import { useUserDataContext } from '../hooks/useUserDataContext';
import { ContentfulCourseFields, ContentfulCreatorFields, Course } from '../models/contentful';
import { FaunaUserData } from '../models/fauna';
import { SUBSCRIPTION_PATH } from '../utils/constants';
import { contentfulImageLoader } from '../utils/contentfulImageLoader';
import { CourseDurationsMap, getAllCoursesByCreator, getDisplayDurationsForAllCourses } from '../utils/courses.server';
import { stripe } from '../utils/payment';
import { getTokensForAllTrailers, TrailerTokenMap } from '../utils/tokens';
import { createCourseURL } from '../utils/ui-helpers';

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // Detect if we're coming back from Auth0 and deal with that URL param mess
  // context: https://community.auth0.com/t/logout-redirect-url-ignores-additional-url-query-parameters-in-custom-rule/73219
  const { auth0Params } = context.query;
  if (typeof auth0Params === 'string') {
    const parsedParams = decodeURIComponent(auth0Params);
    return {
      redirect: {
        permanent: false,
        destination: `${SUBSCRIPTION_PATH}?${parsedParams}`,
      },
    };
  }

  const stripePromoParam = String(context.query.promo ?? '');

  let stripePromotionCode: Stripe.PromotionCode | null = null;

  if (stripePromoParam) {
    const stripePromotionResponse: Stripe.Response<Stripe.ApiList<Stripe.PromotionCode>> =
      await stripe.promotionCodes.list({
        code: stripePromoParam,
      });
    if (stripePromotionResponse.data[0]?.active) {
      stripePromotionCode = stripePromotionResponse.data[0];
    }
  }

  const response = await contentfulClient.getEntries<ContentfulCourseFields>({
    content_type: 'course',
    include: 2,
  });

  const trailerTokens = await getTokensForAllTrailers();
  const courseDurations: CourseDurationsMap = await getDisplayDurationsForAllCourses();
  let heroImage: Asset;
  let coursesForFeaturedCreator: Course[];
  let featuredCreatorName: string;

  switch (stripePromotionCode?.code) {
    case 'JOHNNYHARRIS15':
      heroImage = await contentfulClient.getAsset('3MnlMslkSMUZtmnEEcpL4b');
      coursesForFeaturedCreator = await getAllCoursesByCreator(creatorNamesMap['Johnny Harris']);
      featuredCreatorName = (await contentfulClient.getEntry<ContentfulCreatorFields>(creatorNamesMap['Johnny Harris']))
        .fields.name;
      break;
    case 'IZHARRIS15':
      heroImage = await contentfulClient.getAsset('46IOB6NRl1SxswhCegVgbU');
      coursesForFeaturedCreator = await getAllCoursesByCreator(creatorNamesMap['Iz Harris']);
      featuredCreatorName = (await contentfulClient.getEntry<ContentfulCreatorFields>(creatorNamesMap['Iz Harris']))
        .fields.name;
      break;
    case 'NATHANIELDREW15':
      heroImage = await contentfulClient.getAsset('1WQK0OZxBTkNpxnNsw3ard');
      coursesForFeaturedCreator = await getAllCoursesByCreator(creatorNamesMap['Nathaniel Drew']);
      featuredCreatorName = (
        await contentfulClient.getEntry<ContentfulCreatorFields>(creatorNamesMap['Nathaniel Drew'])
      ).fields.name;
      break;
    case 'JESSDANTE15':
      heroImage = await contentfulClient.getAsset('4PHclUKjglIvjIX1dhlP2r');
      coursesForFeaturedCreator = await getAllCoursesByCreator(creatorNamesMap['Jess Dante']);
      featuredCreatorName = (await contentfulClient.getEntry<ContentfulCreatorFields>(creatorNamesMap['Jess Dante']))
        .fields.name;
      break;
    default:
      // heroImage = await contentfulClient.getAsset('7AhSKaDDS23bAR1j4OzqYG');
      heroImage = await contentfulClient.getAsset('6jRD2hgywo69QYkEhJM3Bm');
      coursesForFeaturedCreator = [];
      featuredCreatorName = '';
      break;
  }

  const { items: mostPopular } = await contentfulClient.getEntries<ContentfulCourseFields>({
    'sys.id[in]': [
      courseNamesMap['Tokyo, Demystified'],
      courseNamesMap['How to Document Your Trip'],
      courseNamesMap['How It Became Paris'],
      courseNamesMap['How to Plan Your Trip'],
    ].join(','),
    include: 10,
  });

  const { items: newest } = await contentfulClient.getEntries<ContentfulCourseFields>({
    'sys.id[in]': [
      courseNamesMap.Berlin,
      courseNamesMap['How to Road Trip Morocco '],
      courseNamesMap.Qatar,
      courseNamesMap.Jordan,
    ].join(','),
    include: 10,
  });

  return {
    props: {
      courses: response.items as Course[],
      trailerTokens,
      courseDurations,
      heroImage,
      stripePromotionCode,
      coursesForFeaturedCreator: coursesForFeaturedCreator.filter((course) =>
        appConfig.subscriptionCourses.includes(course.sys.id)
      ),
      featuredCreatorName,
      mostPopular,
      newest,
    },
  };
};

export type CategoryValue = 'All' | 'Cities' | 'Filmmaking' | 'Culture';
export type SortValue = 'popularity' | 'nameAscending' | 'nameDescending';

interface SubscriptionPageProps {
  courses: Course[];
  trailerTokens: TrailerTokenMap;
  courseDurations: CourseDurationsMap;
  heroImage: Asset;
  stripePromotionCode: Stripe.PromotionCode | null;
  coursesForFeaturedCreator: Course[];
  featuredCreatorName: string;
  mostPopular: Course[];
  newest: Course[];
}

function SubscriptionPage({
  courses,
  trailerTokens,
  courseDurations,
  heroImage,
  stripePromotionCode,
  coursesForFeaturedCreator,
  featuredCreatorName,
  mostPopular,
  newest,
}: SubscriptionPageProps) {
  const { user, enrolledCourses } = useUserDataContext();
  const { filterComponent, matchingCourses: wideCourses } = useCourseFilterSearch(
    courses,
    'Subscription Library',
    'Find everything included in your Bright Trip subscription here'
  );
  const matchingCourses = wideCourses as Course[];
  const router = useRouter();
  const [showPricingModal, setShowPricingModal] = useState<boolean>(() => {
    return (
      (router.query.term === 'annual' || router.query.term === 'monthly' || Boolean(router.query.canceled)) &&
      (!user || !user.subscribed)
    );
  });
  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.05,
  });

  const featuredCourse = courses.find((course) => course.sys.id === appConfig.subscriptionFeatured);

  const filterResultsWithoutPremium =
    matchingCourses.length > 0 ? (
      <div className="isolate grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {matchingCourses
          .filter((c) => appConfig.subscriptionCourses.includes(c.sys.id))
          .map((course) => (
            <CourseCard key={course.sys.id} course={course} />
          ))}
      </div>
    ) : (
      <div className="w-full">
        <Text As="p" variant="body" className="text-center text-gray-400">
          No matching courses
        </Text>
      </div>
    );

  return (
    <Layout
      title="Subscription Library"
      description="Bright Trip"
      fullBleed
      transparentHeader={!user?.subscribed || (Boolean(featuredCourse) && heroInView)}
    >
      <HeroSection
        image={heroImage}
        user={user}
        featuredCourse={featuredCourse}
        ref={heroRef}
        userCourseIds={enrolledCourses.map((c) => c.id)}
        onCTAClick={() => setShowPricingModal(true)}
        code={stripePromotionCode?.code}
        transparent={Boolean(stripePromotionCode)}
      />
      {appConfig.banner.isActive ? (
        // <Banner title={appConfig.banner.title} subtitle={appConfig.banner.subtitle} />
        <MusicbedBanner />
      ) : null}
      {coursesForFeaturedCreator.length > 1 ? (
        <FullWidthSection bgColor="bg-gradient-to-b from-black to-bt-teal-dark">
          <h2 className="mt-6 text-2xl font-bold text-white text-center">
            Get instant access to these courses featuring {featuredCreatorName}
          </h2>
          <div className="mt-4 space-y-4 md:space-y-0 mb-10 md:grid md:grid-cols-4 gap-2">
            {coursesForFeaturedCreator.map((course) => (
              <CourseCard key={course.sys.id} course={course} />
            ))}
          </div>
        </FullWidthSection>
      ) : null}
      {user?.subscribed ? (
        <section className="max-w-screen-xl mx-auto px-8 my-12">
          <ContinueWatching subscriptionOnly trailerTokens={trailerTokens} courseDurations={courseDurations} />
          <div className="mt-6">{filterComponent}</div>
          {filterResultsWithoutPremium}
        </section>
      ) : (
        <>
          <FullWidthSection bgColor="bg-gradient-to-br from-black via-black to-gray-900">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Your Bright Trip subscription includes</h2>
            <div className="flex flex-wrap max-w-screen-2xl gap-4 justify-center drop-shadow-xl pb-8">
              <p className="font-bold text-2xl bg-bt-teal bg-opacity-50 px-5 py-3 rounded-lg text-white">
                Hundreds of detailed guide videos
              </p>
              <p className="font-bold text-2xl bg-bt-teal bg-opacity-50 px-5 py-3 rounded-lg text-white ">
                New Travel Guide locations added monthly
              </p>
              <p className="font-bold text-2xl bg-bt-teal bg-opacity-50 px-5 py-3 rounded-lg text-white ">
                High-quality lessons crafted by real travel professionals
              </p>
              <p className="font-bold text-2xl bg-bt-teal bg-opacity-50 px-5 py-3 rounded-lg text-white ">
                Discounts on premium courses
              </p>
            </div>
          </FullWidthSection>
          <FullWidthSection bgColor="bg-gradient-to-tl from-black to-gray-900">
            <section className="mb-4 isolate">
              <h2 className="text-3xl font-bold mb-1 text-center px-4 text-white">
                Perfectly plan your trip, every time
              </h2>
              <p className="text-white text-lg my-1 text-center">
                Learn the food, culture, transportation, and best time to visit your next destination with our
                expert-led Travel Guides
              </p>
              <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-4">
                {newest.map((course) => (
                  <CourseCard
                    key={course.sys.id}
                    course={course}
                    imageSizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 300px"
                  />
                ))}
              </div>
            </section>
          </FullWidthSection>
          <FullWidthSection bgColor="bg-gradient-to-tr from-black to-gray-900">
            <section className="mb-6">
              <h2 className="text-3xl font-bold mb-1 text-center px-4 text-white">Learn from full-time travelers</h2>
              <p className="text-white text-lg my-1 text-center">
                See how travel creators make the most out of every experience, and how they recommend you do the same
              </p>
              <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-4">
                {mostPopular.map((course) => (
                  <CourseCard
                    key={course.sys.id}
                    course={course}
                    imageSizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 25vw, 300px"
                  />
                ))}
              </div>
            </section>
          </FullWidthSection>
          <FullWidthSection bgColor="bg-gradient-to-tr from-black to-gray-900">
            <section className="mb-6">
              <h2 className="text-3xl font-bold mb-1 text-center px-4 text-white">Be part of what&apos;s next</h2>
              <p className="text-white text-lg my-1 text-center">
                Experience new location guides every month and join the Bright Trip community to connect and grow with
                travelers just like you
              </p>
              <div className="grid gap-2 grid-cols-1 md:grid-cols-3 lg:grid-cols-3 p-4">
                <Card
                  imageUrl="/images/coming-soon/guides/mexico-city.jpg"
                  imageSizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px"
                >
                  <div className="absolute left-0 w-full h-full bg-gradient-to-b from-transparent via-black opacity-40" />
                  <div className="flex flex-col justify-center items-center text-white text-4xl font-bold w-full h-full text-center uppercase drop-shadow-md">
                    Mexico City
                    <p className="text-xs text-center">Coming Soon</p>
                  </div>
                </Card>
                <Card
                  imageUrl="/images/coming-soon/guides/paris.jpg"
                  imageSizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px"
                >
                  <div className="absolute left-0 w-full h-full bg-gradient-to-b from-transparent via-black opacity-40" />
                  <div className="flex flex-col justify-center items-center text-white text-4xl font-bold w-full h-full text-center uppercase drop-shadow-md">
                    Paris
                    <p className="text-xs text-center">Coming Soon</p>
                  </div>
                </Card>
                <Card
                  imageUrl="/images/coming-soon/guides/ta.jpg"
                  imageSizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px"
                >
                  <div className="absolute left-0 w-full h-full bg-gradient-to-b from-transparent via-black opacity-40" />
                  <div className="flex flex-col justify-center items-center text-white text-4xl font-bold w-full h-full text-center uppercase drop-shadow-md">
                    Te Araroa
                    <p className="text-xs text-center">Coming Soon</p>
                  </div>
                </Card>
              </div>
            </section>
          </FullWidthSection>
          <FullWidthSection bgColor="bg-gradient-to-bl from-black to-bt-teal-dark">
            <section className="mb-24">
              <h2 className="text-3xl font-bold mb-4 text-center px-4 text-white">What travelers are saying</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="shadow-md flex flex-col justify-between bg-bt-background-light bg-opacity-90 text-gray-700 p-6 px-8 rounded-md">
                  <blockquote>{`"I probably would never have even thought of renting a small camper van if I hadn't taken [the Iceland] course. That's what I ended up doing and it was definitely the best and most affordable way to explore Southern Iceland for the first time."`}</blockquote>
                  <p className="italic mt-5 font-bold text-bt-teal">{`— Monica M.`}</p>
                </div>
                <div className="shadow-md flex flex-col justify-between bg-bt-background-light bg-opacity-90 text-gray-700 p-6 px-8 rounded-md">
                  <blockquote>{`"I thougnt the chapter on getting from the airport to London was incredibly helpful, as well as explaining the Tube system. Jess gives a lot of insider tips a local would know that a traveler wouldn't on their first trip, which really helps a lot. This course is definitely worth it."`}</blockquote>
                  <p className="italic mt-5 font-bold text-bt-teal">{`— Noor K.`}</p>
                </div>
                <div className="shadow-md flex flex-col justify-between bg-bt-background-light bg-opacity-90 text-gray-700 p-6 px-8 rounded-md">
                  <blockquote>{`"This really helped us prepare and make the most of our trip to Costa Rica. For example, this course was the reason we decided to add Corcovado to our itinerary, which ended up being a great adventure."`}</blockquote>
                  <p className="italic mt-5 font-bold text-bt-teal">{`— Miriam K.`}</p>
                </div>
              </div>
              <div className="mt-24 flex flex-col items-center">
                <Button
                  onClick={() => setShowPricingModal(true)}
                  size="large"
                  className="my-3 md:my-5 mt-4 md:mt-6 md:font-bold"
                >
                  Subscribe
                </Button>
                <p className="text-xs md:text-sm text-white opacity-60">Plans from $4.99 per month</p>
                <p className="text-xs md:text-sm text-white opacity-60">7-day money-back guarantee</p>
              </div>
            </section>
          </FullWidthSection>
        </>
      )}
      <Modal open={showPricingModal} onClose={() => setShowPricingModal(false)}>
        <SubscriptionPricing stripePromotionCode={stripePromotionCode} />
      </Modal>
    </Layout>
  );
}

export default SubscriptionPage;

interface HeroSectionProps {
  image: Asset;
  user?: FaunaUserData;
  featuredCourse?: Course;
  userCourseIds?: string[];
  onCTAClick?: () => void;
  code?: string;
  transparent?: boolean;
}

const HeroSection = forwardRef(function HeroSection(
  { user, featuredCourse, userCourseIds, onCTAClick, image, transparent = false }: HeroSectionProps,
  externalRef: Ref<HTMLDivElement>
) {
  let content = (<></>) as React.ReactNode;
  let imageURL = '';

  if (user?.subscribed) {
    if (featuredCourse) {
      imageURL = featuredCourse.fields.hero?.fields.file.url ?? '';
      content = (
        <div className="z-10 max-w-screen-xl mx-auto w-full px-8 py-12">
          <h2 className="text-4xl max-w-md font-bold text-white">{featuredCourse.fields.title}</h2>
          <p className="text-body font-bodycopy mt-1 max-w-sm text-gray-300">
            {featuredCourse.fields.oneLineDescription}
          </p>
          <div className="flex items-end gap-3 mt-1">
            <CourseCTAButton
              course={featuredCourse}
              buttonLocation="hero"
              buttonProps={{ className: 'rounded-full px-5' }}
            />
            <Link href={createCourseURL(featuredCourse, userCourseIds)}>
              <Button className="mt-5 px-5" variant="background">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      );
    }
  } else {
    imageURL = image.fields.file.url;
    content = (
      <div className="z-10 p-8 md:p-12 text-center flex flex-col items-center justify-center h-full w-full">
        <div
          className={`relative h-min p-8 md:p-16 pb-7 md:pb-14 rounded-2xl drop-shadow-2xl ${
            transparent ? '' : 'bg-gradient-to-tr from-black to-gray-900'
          }`}
        >
          <h1 className="text-2xl md:text-5xl  font-bold text-white">Travel like a Pro</h1>
          <p className="text-sm md:text-2xl text-white max-w-[14rem] md:max-w-[18rem] mx-auto mt-2 md:mt-3 leading-snug md:leading-[1.75rem] opacity-80">
            Learn the world from top creators and experts
          </p>
          <Button onClick={onCTAClick} size="medium" className="my-3 md:my-5 mt-4 md:mt-6 md:font-bold md:uppercase">
            Subscribe
          </Button>
          <p className="text-xs md:text-sm text-white opacity-60">Plans from $4.99 per month</p>
          <p className="text-xs md:text-sm text-white opacity-60">7-day money-back guarantee</p>
        </div>
      </div>
    );
  }

  return (
    <header
      className={`flex w-full items-end justify-start relative mt-nav ${
        user?.subscribed ? 'h-[60vh]' : 'h-[70vh]'
      } isolate`}
    >
      <Image
        className="object-cover absolute w-full h-full"
        src={imageURL}
        fill
        alt=""
        loader={contentfulImageLoader}
      />
      <div
        className="absolute top-0 right-0 left-0 bottom-0 bg-gradient-to-t from-black to-transparent"
        ref={externalRef}
      />
      {content}
    </header>
  );
});
