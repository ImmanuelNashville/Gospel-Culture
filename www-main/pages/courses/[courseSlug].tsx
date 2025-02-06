import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { GetStaticPaths, GetStaticPropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, useEffect, useRef, useState } from 'react';

import Button from '../../components/Button';
import Card from '../../components/Card';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import Text from '../../components/Text';

import contentfulClient from '../../contentful/contentfulClient';
import { ContentfulCourseFields, ContentfulMuxVideoFields, Course } from '../../models/contentful';

import { DocumentDownloadIcon, MapIcon, ShieldCheckIcon, ShoppingCartIcon } from '@heroicons/react/outline';
import {
  ClockIcon,
  ClockIcon as ClockIconSolid,
  MailIcon,
  PlayIcon as HeroPlayIcon,
  VideoCameraIcon,
  XIcon,
} from '@heroicons/react/solid';
import PlayIcon from 'components/icons/PlayIcon';
import { Entry } from 'contentful';
import { add } from 'date-fns';
import { useCookies } from 'react-cookie';
import { useInView } from 'react-intersection-observer';
import { IconBadge } from '../../components/Badges';
import CreatorCard from '../../components/CreatorCard';
import VideoPlayer from '../../components/VideoPlayer';
import VideoThumbnail from '../../components/VideoThumbnail';
import * as fbpixel from '../../lib/fbpixel';
import * as gtag from '../../lib/gtag';
import * as mpClient from '../../mixpanel/client';
import { FaunaOrderSource, FaunaUserData } from '../../models/fauna';
import { formatDuration } from '../../utils';
import { getDurationsForVideosFromFile } from '../../utils/courses.server';
import { getMuxTokensForCourseMarketing } from '../../utils/tokens';

import MuxPlayerElement from '@mux/mux-player';
import Image from 'next/image';
import appConfig from '../../appConfig';
import CourseCTAButton from '../../components/CourseCTAButton';
import CoursePrice from '../../components/CoursePrice';
import FullPageHero from '../../components/FullPageHero';
import LaunchDate from '../../components/LaunchDate';
import CourseTrailer from '../../components/Pages/CourseMarketing/CourseTrailer';
import FullWidthSection from '../../components/PageSections/FullWidthSection';
import courseNamesMap from '../../courseNames';
import { useProductNotification } from '../../hooks/useProductNotification';
import jordanPassImage from '../../public/images/jordan-pass-2.png';
import styles from '../../styles/CourseMarketing.module.css';
import { contentfulImageLoader } from '../../utils/contentfulImageLoader';
import { buildCourseOpenGraph } from '../../utils/openGraph';
import ZionAdgCalloutSection from '../../components/ZionAdgCalloutSection';
import { useBrightTripUser } from 'hooks/useBrightTripUser';

export const getStaticPaths: GetStaticPaths = async () => {
  const courses = await contentfulClient.getEntries<{ slug: string }>({
    select: 'fields.slug',
    content_type: 'course',
  });

  return {
    paths: courses.items.map((item) => {
      return `/courses/${item.fields.slug}`;
    }),
    fallback: true,
  };
};

export const getStaticProps = async (context: GetStaticPropsContext<{ courseSlug: string }>) => {
  const { params: { courseSlug } = {} } = context;
  const response = await contentfulClient.getEntries<ContentfulCourseFields>({
    'fields.slug': String(courseSlug),
    content_type: 'course',
    include: 10,
  });

  const matchedCourse = response.items[0];
  const tokens = getMuxTokensForCourseMarketing(matchedCourse);
  const videoAssets = getDurationsForVideosFromFile(matchedCourse);

  return {
    props: {
      course: matchedCourse ?? null,
      tokens,
      videoAssets,
    },
    revalidate: 60,
  };
};

const trackJordanPassClick = () => {
  const data: mpClient.ExternalTrafficSentData = {
    type: 'DMO',
    partner: 'Jordan',
    product: 'Jordan Pass',
    location: 'Jordan Pass section on CMP',
  };
  mpClient.track(mpClient.Event.ExternalTrafficSent, data);
};

interface CourseDetailsPageProps {
  course: Course | undefined;
  tokens: ReturnType<typeof getMuxTokensForCourseMarketing>;
  videoAssets: ReturnType<typeof getDurationsForVideosFromFile>;
}

const CourseDetailsPage: FC<CourseDetailsPageProps> = ({ course, tokens, videoAssets }) => {
  const router = useRouter();
  const [videoForModal, setVideoForModal] = useState<Entry<ContentfulMuxVideoFields>>();
  const { ref: trailerRef, inView: trailerInView } = useInView({
    threshold: 0.5,
  });
  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.05,
  });
  const { ref: sidebarRef, inView: sidebarInView } = useInView({
    threshold: 0.5,
  });
  const [, setCookie, removeCookie] = useCookies();
  const [trailerIsMuted, setTrailerIsMuted] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const heroTrailerRef = useRef<MuxPlayerElement>(null);
  const { openModal, notifyModal } = useProductNotification(
    'Stay updated about Sailing the World',
    'Sailing The World Part 1'
  );
  const { user } = useBrightTripUser();

  useEffect(() => {
    const source: FaunaOrderSource = {
      utm_source: router.query.utm_source,
      utm_medium: router.query.utm_medium,
      utm_id: router.query.utm_id,
      utm_campaign: router.query.utm_campaign,
      utm_term: router.query.utm_term,
      utm_content: router.query.utm_content,
    };

    if (source.utm_source) {
      removeCookie('s');
      // ?? todo add secure for production
      setCookie('s', JSON.stringify(source), {
        path: '/',
        // needs to be lax
        sameSite: 'lax',
        httpOnly: false,
        expires: add(new Date(), { years: 1 }),
      });
    }
  }, [router.query, setCookie, removeCookie]);

  useEffect(() => {
    if (course) {
      try {
        fbpixel.event(fbpixel.Action.track, fbpixel.StandardEvent.ViewContent, {
          content_ids: [course.sys.id],
          content_type: 'course',
          content_category: course.fields.category.map((c) => c.fields.slug),
          value: course.fields.price ? course.fields.price / 100 : 0,
          currency: 'USD',
        });

        gtag.event(gtag.Action.ViewItem, {
          currency: 'USD',
          value: course.fields.price ? course.fields.price / 100 : 0,
          items: [
            {
              item_id: course.sys.id,
              item_name: course.fields.title,
              price: course.fields.price ? course.fields.price / 100 : 0,
              quantity: 1,
              ...(course.fields.category?.[0] && {
                item_category: course.fields.category[0].fields.slug,
              }),
              ...(course.fields.category?.[1] && {
                item_category2: course.fields.category[1].fields.slug,
              }),
              ...(course.fields.category?.[2] && {
                item_category3: course.fields.category[2].fields.slug,
              }),
              ...(course.fields.category?.[3] && {
                item_category4: course.fields.category[3].fields.slug,
              }),
              ...(course.fields.category?.[4] && {
                item_category5: course.fields.category[4].fields.slug,
              }),
            },
          ],
        });
      } catch (e) {
        console.error(e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shouldShowSubscriptionTreatment = (user: FaunaUserData | undefined) => {
    if (!course?.sys.id) return false;
    return appConfig.subscriptionCourses.includes(course.sys.id) && user?.subscribed;
  };

  const handlePlayTrailer = () => {
    document.getElementById('trailer')?.scrollIntoView({ behavior: 'smooth' });
    setTrailerIsMuted(false);

    mpClient.track(mpClient.Event.PlayTrailer, {
      courseId: course?.sys.id ?? 'Unknown Course ID',
      courseTitle: course?.fields.title ?? 'Unknown Course Title',
      creatorId: course?.fields.creator?.sys.id ?? 'Unknown Creator ID',
      creatorName: course?.fields.creator?.fields.name ?? 'Unknown Creator Name',
    });

    window.gtag('event', 'conversion', {
      send_to: 'AW-734177645/pXhjCKXYnK4DEO3Sit4C',
    });
  };

  const mpPlaySample = (sample: Entry<ContentfulMuxVideoFields>) => {
    mpClient.track(mpClient.Event.PlaySample, {
      name: sample.fields.internalName,
      courseId: course?.sys.id ?? 'Unknown Course ID',
      courseTitle: course?.fields.title ?? 'Unknown Course Title',
      creatorId: course?.fields.creator?.sys.id ?? 'Unknown Creator ID',
      creatorName: course?.fields.creator?.fields.name ?? 'Unknown Creator Name',
    });

    window.gtag('event', 'conversion', {
      send_to: 'AW-734177645/pXhjCKXYnK4DEO3Sit4C',
    });
  };

  const numberOfVideosInCourse =
    course?.fields.chapters?.reduce((sum, chapter) => sum + (chapter.fields.lessons?.length ?? 0), 0) ?? 0;

  const renderHeroMain = (course: Course) => (
    <>
      <div className="backdrop-blur-xl backdrop-saturate-150 bg-white/10 rounded-3xl px-2 py-4 sm:p-4 md:p-8 pt-5 text-white/80">
        <LaunchDate course={course} />
        <h1 className="text-white mx-auto text-2xl md:text-4xl font-bold uppercase leading-[1.5rem] max-w-lg">
          {course.fields.title}
        </h1>
        <p className="text-md sm:text-2xl text-white/80 font-bodycopy">
          {course.fields.creator?.fields.name ? `with ${course.fields.creator?.fields.name}` : ''}
        </p>
        <hr className="border-white/5 my-3" />
        <div className="font-bodycopy text-sm sm:text-md">
          <div className="flex justify-center items-center gap-1.5 sm:gap-3">
            <div className="flex justify-center sm:justify-start items-center gap-1 font-bodycopy">
              <ClockIcon className="w-4 h-4" />
              <span className="whitespace-nowrap">
                {formatDuration(Number(videoAssets?.courseTotal?.duration ?? 0), 'humanized')}
              </span>
            </div>
            {'•'}
            <div className="flex justify-center sm:justify-start items-center gap-1 font-bodycopy">
              <VideoCameraIcon className="w-4 h-4" />
              <span className="whitespace-nowrap">
                {numberOfVideosInCourse} video{numberOfVideosInCourse === 1 ? '' : 's'}
              </span>
            </div>
          </div>
          <hr className="border-white/5 my-3" />
          <p className="px-4 sm:px-8 text-center leading-snug max-w-md mx-auto">
            {course.fields.oneLineDescription ?? ''}
          </p>
          {course.fields.promoText && (
            <>
              <hr className="border-white/5 my-3" />
              <span className="bg-bt-teal px-3 py-1.5 rounded-full">{course.fields.promoText}</span>
            </>
          )}
        </div>
      </div>
      <div className="m-5 flex flex-col md:flex-row gap-3 max-w-max mx-auto">
        <Button
          size="medium"
          variant="glassSecondary"
          className="font-bold whitespace-nowrap"
          onClick={handlePlayTrailer}
          icon={<HeroPlayIcon className="text-white" />}
        >
          Watch Trailer
        </Button>
        <CourseCTAButton
          course={course}
          buttonLocation="hero"
          buttonProps={{
            size: 'medium',
            className: 'font-bold rounded-full whitespace-nowrap',
            variant: 'glassPrimary',
            icon: <ShoppingCartIcon />,
          }}
        />
      </div>
    </>
  );

  const renderHeroFooterRight = (courseId: string) => {
    return courseId === courseNamesMap['Visual Storytelling'] ? (
      <a href="https://mscbd.fm/brghttrp" target="_blank" rel="noopener noreferrer" className="flex items-center">
        <Text variant="body" alwaysWhite>
          In partnership with
        </Text>
        <img src="/images/partners/music-bed.svg" height="20" width="140" alt="Music Bed" />
      </a>
    ) : null;
  };

  const trailerVideoToken = tokens?.video[course?.fields.trailer?.fields.video?.signedPlaybackId ?? ''];
  const trailerPosterToken = tokens?.image[course?.fields.trailer?.fields.video?.signedPlaybackId ?? ''];
  const storyboardToken = tokens?.storyboard[course?.fields.trailer?.fields.video?.signedPlaybackId ?? ''];

  const handleShowTrailer = () => {
    setShowTrailer(true);
    setTimeout(() => {
      heroTrailerRef.current?.play();
      mpClient.track(mpClient.Event.PlayTrailer, {
        courseId: course?.sys.id ?? 'Unknown Course ID',
        courseTitle: course?.fields.title ?? 'Unknown Course Title',
        creatorId: course?.fields.creator?.sys.id ?? 'Unknown Creator ID',
        creatorName: course?.fields.creator?.fields.name ?? 'Unknown Creator Name',
      });
    }, 1000);
  };

  const handleHideTrailer = () => {
    setShowTrailer(false);
    setTimeout(() => {
      heroTrailerRef.current?.pause();
    }, 500);
  };

  const renderCMPLayout = (course: Course) => {
    /* TRAVEL GUIDE CMP */
    if (appConfig.travelGuides.includes(course.sys.id)) {
      return (
        <div>
          <FullPageHero
            ref={heroRef}
            bgImageUrl={course.fields.hero?.fields.file.url}
            video={
              course.fields.heroVideo
                ? {
                    muxVideo: course.fields.heroVideo,
                    muxTokens: {
                      thumbnail: tokens.image[course.fields.heroVideo.fields.video?.signedPlaybackId ?? ''],
                      video: tokens.video[course.fields.heroVideo.fields.video?.signedPlaybackId ?? ''],
                      storyboard: tokens.storyboard[course.fields.heroVideo.fields.video?.signedPlaybackId ?? ''],
                    },
                  }
                : undefined
            }
            mainContent={
              <div
                className={`transition-all duration-700 ${
                  showTrailer ? 'opacity-0 scale-110' : 'opacity-100 delay-100 scale-100'
                }`}
              >
                <div
                  className={`backdrop-blur-xl backdrop-saturate-150 bg-white/10 rounded-3xl px-2 py-8 sm:p-4 md:p-8 pt-5 text-white/80`}
                >
                  <LaunchDate course={course} />
                  <h1 className="pt-5 px-1 text-white mx-auto text-3xl sm:text-7xl font-bold uppercase leading-none mb-3 md:pt-0 md:mb-0.5 max-w-lg">
                    {course.fields.title}
                  </h1>
                  <p className="text-md max-w-xs leading-tight px-6 sm:text-xl text-white/80 font-bodycopy mx-auto md:max-w-lg md:px-0 md:mt-0">
                    A Bright Trip Travel Guide with {course.fields.creator?.fields.name}
                  </p>
                  <hr className="border-white/5 my-3" />
                  <div className="font-bodycopy text-sm sm:text-md">
                    <div className="flex justify-center items-center gap-1.5 sm:gap-3">
                      <div className="flex justify-center sm:justify-start items-center gap-1 font-bodycopy">
                        <ClockIcon className="w-4 h-4" />
                        <span className="whitespace-nowrap">
                          {formatDuration(Number(videoAssets?.courseTotal?.duration ?? 0), 'humanized')}
                        </span>
                      </div>
                      {'•'}
                      <div className="flex justify-center sm:justify-start items-center gap-1 font-bodycopy">
                        <VideoCameraIcon className="w-4 h-4" />
                        <span className="whitespace-nowrap">
                          {numberOfVideosInCourse} video
                          {numberOfVideosInCourse === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                    <hr className="border-white/5 my-3" />
                    <p className="px-4 sm:px-8 text-center leading-snug max-w-sm mx-auto">
                      {course.fields.oneLineDescription ?? ''}
                    </p>
                    {course.fields.promoText && (
                      <>
                        <hr className="border-white/5 my-3" />
                        <span className="bg-bt-teal px-3 py-1.5 rounded-full">{course.fields.promoText}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="m-5 flex flex-col md:flex-row gap-3 max-w-max mx-auto">
                  <Button
                    size="medium"
                    variant="background"
                    className="font-bold whitespace-nowrap"
                    onClick={handleShowTrailer}
                    disabled={showTrailer}
                    icon={<HeroPlayIcon className="text-bt-teal" />}
                  >
                    Watch Trailer
                  </Button>
                  <CourseCTAButton
                    course={course}
                    buttonLocation="hero"
                    withPrice
                    buttonProps={{
                      size: 'medium',
                      className: 'font-bold rounded-full whitespace-nowrap',
                      icon: <ShoppingCartIcon />,
                    }}
                  />
                </div>
              </div>
            }
          />
          {course.fields.trailer ? (
            <div
              className={`${
                showTrailer ? 'opacity-100 z-20 delay-100' : 'opacity-0 z-0'
              } mx-auto transition-all duration-700 w-[95%] max-w-screen-xl absolute inset-0 flex items-center justify-center`}
            >
              <div className="rounded-2xl leading-[0] overflow-hidden relative">
                <VideoPlayer
                  style={{
                    visibility: showTrailer ? 'visible' : 'hidden',
                  }}
                  ref={heroTrailerRef}
                  muxVideo={course.fields.trailer}
                  muxToken={{
                    video: trailerVideoToken,
                    thumbnail: trailerPosterToken,
                    storyboard: storyboardToken,
                  }}
                  onEnded={handleHideTrailer}
                />
                <button
                  onClick={handleHideTrailer}
                  className="absolute top-2 right-2 z-10 bg-black bg-opacity-60 rounded-full p-1"
                  aria-label="Close trailer"
                >
                  <XIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          ) : null}
          {course.sys.id === courseNamesMap['Zion National Park'] ? (
            <FullWidthSection
              bgColor="bg-gradient-to-tr from-bt-orange-darker via-bt-orange/20 to-bt-orange-light"
              secondaryOverlay={<div className="absolute inset-0 bg-gradient-to-l from-black/20 to-bt-teal/60" />}
            >
              <ZionAdgCalloutSection location="CMP" />
            </FullWidthSection>
          ) : null}
          {course.sys.id === courseNamesMap['Jordan'] ? (
            <FullWidthSection
              bgColor="bg-gradient-to-tr from-bt-orange-darker via-bt-orange/20 to-bt-orange-light"
              secondaryOverlay={<div className="absolute inset-0 bg-gradient-to-l from-black/20 to-bt-teal/60" />}
            >
              <div
                id="jordan-pass"
                className="flex flex-col md:flex-row mx-auto shadow-md rounded-xl md:rounded-3xl overflow-hidden max-h-min"
              >
                <div className="relative w-full h-40 md:h-auto overflow-hidden">
                  <Image
                    src={jordanPassImage}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 800px"
                    className="object-cover bg-bottom"
                  />
                </div>
                <div className="flex flex-col items-center md:items-start w-full bg-gradient-to-r from-black/80 to-black/50 p-8">
                  <h2 className="text-white/90 text-xl md:text-3xl font-bold mb-2 leading-tight">
                    Save money with the Jordan Pass
                  </h2>
                  <p className="text-bodySmall md:text-body text-white/70 max-w-lg font-bodycopy leading-relaxed">
                    The Jordan Pass is the ultimate sightseeing package, tailor-made for visitors to the country. Make
                    the most out of your trip by visiting top sights and attractions while saving time, money, and
                    effort.
                  </p>

                  <a href="https://www.jordanpass.jo/">
                    <Button
                      variant="background"
                      size="small"
                      className="mt-6 font-bold px-7"
                      onClick={trackJordanPassClick}
                    >
                      Buy Your Jordan Pass
                    </Button>
                  </a>
                </div>
              </div>
            </FullWidthSection>
          ) : null}
          <FullWidthSection
            bgColor="bg-gradient-to-tr from-bt-green via-black/80 to-bt-orange text-white"
            secondaryOverlay={
              <div className="absolute inset-0 bg-gradient-to-tl from-bt-green via-bt-teal/40 to-black/20" />
            }
          >
            <div className="divide-y divide-white/20 mt-6">
              {course.fields.chapters?.map((chapter) => (
                <div key={chapter.sys.id} className="relative top-0 py-8 grid md:grid-cols-3">
                  <div className="md:sticky md:top-40 h-fit col-span-2 md:col-span-1 max-w-sm">
                    <h3 className="text-2xl md:text-3xl font-bold text-white/90 leading-tight mb-3 pr-6">
                      {chapter.fields.title}
                    </h3>
                  </div>
                  <div className="col-span-2 space-y-4">
                    {chapter.fields.lessons?.map((lesson) => (
                      <Link
                        href={`/my-courses/${course.fields.slug}?v=${lesson.sys.id}`}
                        key={lesson.sys.id}
                        className="block hover:scale-[102%] hover:shadow-xl duration-200"
                      >
                        <div className="bg-white/80 dark:bg-black/40 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 md:gap-5 items-start lg:items-center">
                          <div className="w-full sm:w-40 md:w-40 lg:w-80 shrink-0">
                            <Card
                              innerClassName="filter-none rounded-lg"
                              imageUrl={
                                lesson.fields.video?.fields.thumbnail?.fields.file.url ??
                                `https://image.mux.com/${
                                  lesson.fields.video?.fields.video?.signedPlaybackId
                                }/thumbnail.jpg?token=${
                                  tokens.image[lesson.fields.video?.fields.video?.signedPlaybackId ?? '']
                                }`
                              }
                              imageSizes="(max-width: 768px) 100vw, 25vw"
                            />
                          </div>
                          <div className="flex flex-col justify-between">
                            <h4 className="text-black/80 dark:text-white font-bold text-md leading-tight md:text-lg lg:text-2xl">
                              {lesson.fields.title}
                            </h4>
                            {lesson.fields.video?.fields.creator?.sys.id &&
                            lesson.fields.video?.fields.creator?.sys.id !== course.fields.creator?.sys.id ? (
                              <p className="text-md font-bodycopy text-bt-teal dark:text-bt-teal-light">
                                with {lesson.fields.video.fields.creator.fields.name}
                              </p>
                            ) : null}
                            {lesson.fields.description ? (
                              <p className="font-bodycopy text-sm md:text-md lg:text-[15px] text-black/60 dark:text-white/80 leading-normal max-w-sm mt-1">
                                {lesson.fields.description}
                              </p>
                            ) : null}
                            {lesson.fields.video?.fields.video?.duration ? (
                              <div className="flex items-center gap-1 text-black/40 dark:text-white/60 font-bodycopy text-xs font-bold mt-2 md:mt-4">
                                <ClockIconSolid className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{formatDuration(lesson.fields.video.fields.video.duration, 'mm:ss')}</span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FullWidthSection>
        </div>
      );
    }
    /* END TRAVEL GUIDE CMP */

    /* DEFAULT CMP */
    return (
      <div>
        <FullPageHero
          ref={heroRef}
          video={
            course.fields.heroVideo
              ? {
                  muxVideo: course.fields.heroVideo,
                  muxTokens: {
                    thumbnail: tokens.image[course.fields.heroVideo.fields.video?.signedPlaybackId ?? ''],
                    video: tokens.video[course.fields.heroVideo.fields.video?.signedPlaybackId ?? ''],
                    storyboard: tokens.storyboard[course.fields.heroVideo.fields.video?.signedPlaybackId ?? ''],
                  },
                }
              : undefined
          }
          bgImageUrl={course.fields.hero?.fields.file.url}
          mainContent={renderHeroMain(course)}
          footerContent={{
            right: renderHeroFooterRight(course.sys.id),
          }}
          imageClassName={
            course.sys.id === courseNamesMap['Short-Form Storytelling'] ? 'object-right-top md:object-center-top' : ''
          }
        />
        <main className="mx-auto -mt-20 max-w-screen-2xl px-8 py-6 pt-28" id="trailer">
          <section className="flex flex-col items-center gap-6 md:grid md:grid-cols-3 lg:grid-cols-4 md:items-start">
            <div className="col-span-2 lg:col-span-3">
              <CourseTrailer
                ref={trailerRef}
                course={course}
                isVisible={trailerInView}
                isMuted={trailerIsMuted}
                muxToken={{
                  video: trailerVideoToken,
                  thumbnail: trailerPosterToken,
                  storyboard: storyboardToken,
                }}
              />
              <div className="my-6 grid grid-cols-1 lg:grid-cols-2 w-full gap-6 items-start">
                <div className="w-full rounded-2xl bg-bt-background-light dark:bg-gray-800 shadow-md p-8 pb-9 border dark:border-transparent">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">About This Course</h2>
                  <p className="text-body font-bodycopy mt-1 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {course.fields.description ?? 'More info coming soon'}
                  </p>
                </div>
                {course.fields.whatYouWillLearn && (
                  <div
                    className={`${styles.whatYouWillLearn} text-gray-800 dark:text-gray-400 leading-snug font-bodycopy w-full rounded-2xl bg-bt-background-light dark:bg-gray-800 shadow-md p-8 pb-9 border dark:border-transparent`}
                  >
                    <h2 className="font-sans text-2xl font-bold text-gray-800 dark:text-gray-200">
                      What You&apos;ll Learn
                    </h2>
                    {documentToReactComponents(course.fields.whatYouWillLearn)}
                  </div>
                )}
              </div>
            </div>
            <aside
              ref={sidebarRef}
              className="col-span-1 lg:col-span-1 bg-bt-background-light dark:bg-gray-800 rounded-2xl overflow-hidden text-center shadow-lg border dark:border-transparent"
            >
              <div className="p-6">
                <LaunchDate course={course} />
                <h2 className="text-gray-900 text-2xl font-bold dark:text-gray-100 leading-tight mb-0.5">
                  {course.fields.title}
                </h2>
                <p className="text-lg font-bodycopy text-bt-teal dark:text-bt-teal-light">
                  with {course.fields.creator?.fields.name ?? 'Unknown Creator'}
                </p>

                <div className="my-4">
                  {!shouldShowSubscriptionTreatment(user) ? (
                    <CoursePrice
                      courseId={course.sys.id}
                      As="h3"
                      variant="headline4"
                      className="text-gray-900"
                      price={course.fields.price ?? 0}
                      showPromo
                    />
                  ) : null}
                </div>
                <CourseCTAButton
                  course={course}
                  buttonLocation="content"
                  buttonProps={{ className: 'rounded-full px-7' }}
                />
                {shouldShowSubscriptionTreatment(user) ? (
                  <p className="text-caption font-bodycopy mt-5 text-gray-500 dark:text-gray-400">
                    Available with your Bright Trip subscription
                  </p>
                ) : (
                  <>
                    <p className="text-caption font-bodycopy mt-5 text-gray-500 dark:text-gray-400">
                      30 Day Money-Back Guarantee
                    </p>
                    <p className="text-caption font-bodycopy text-gray-500 dark:text-gray-400">No questions asked</p>
                  </>
                )}
              </div>
              <div className="bg-gradient-to-tr from-bt-teal to-bt-teal-light dark:from-bt-teal-dark dark:to-bt-teal-light/30 p-6 text-left">
                <h4 className="text-subtitle2 uppercase font-bold text-white/90">This course includes</h4>
                <div className="mt-4 flex flex-col gap-3 text-white/70">
                  <div className="grid items-center gap-3" style={{ gridTemplateColumns: '28px 1fr' }}>
                    <IconBadge className="bg-bt-teal-ultraLight/40 dark:bg-bt-teal-ultraLight/20 dark:text-white/60">
                      <ClockIcon className="w-6 h-6" />
                    </IconBadge>

                    <span className="text-body font-bodycopy">
                      {formatDuration(Number(videoAssets?.courseTotal?.duration ?? 0), 'humanized')} of video
                    </span>
                  </div>
                  <div className="grid items-center gap-3" style={{ gridTemplateColumns: '28px 1fr' }}>
                    <IconBadge className="bg-bt-teal-ultraLight/40 dark:bg-bt-teal-ultraLight/20 dark:text-white/60">
                      <VideoCameraIcon className="w-6 h-6" />
                    </IconBadge>
                    <span className="text-body font-bodycopy">
                      {numberOfVideosInCourse} Lesson{numberOfVideosInCourse === 1 ? '' : 's'}
                    </span>
                  </div>
                  {(course.fields.resources?.length ?? 0 > 0) && (
                    <div className="grid items-center gap-3" style={{ gridTemplateColumns: '28px 1fr' }}>
                      <IconBadge className="bg-bt-teal-ultraLight/40 dark:bg-bt-teal-ultraLight/20 dark:text-white/60">
                        <DocumentDownloadIcon className="w-6 h-6" />
                      </IconBadge>
                      <span className="text-body font-bodycopy">Downloadable Course Summary</span>
                    </div>
                  )}
                  {course.fields.courseMap && (
                    <div className="grid items-center gap-3" style={{ gridTemplateColumns: '28px 1fr' }}>
                      <IconBadge className="bg-bt-teal-ultraLight/40 dark:bg-bt-teal-ultraLight/20 dark:text-white/60">
                        <MapIcon className="w-6 h-6" />
                      </IconBadge>
                      <span className="text-body font-bodycopy0">Course Map</span>
                    </div>
                  )}

                  {!shouldShowSubscriptionTreatment(user) && (
                    <div className="grid items-center gap-3" style={{ gridTemplateColumns: '28px 1fr' }}>
                      <IconBadge className="bg-bt-teal-ultraLight/40">
                        <ShieldCheckIcon className="w-6 h-6" />
                      </IconBadge>

                      <span className="text-body font-bodycopy">Lifetime Access</span>
                    </div>
                  )}
                </div>
              </div>
              {course.sys.id === courseNamesMap['Sailing Part 1: Getting Started'] ? (
                <div className="text-center p-8 bg-gradient-to-bl from-bt-teal to-bt-teal-light text-white border-t border-black/20">
                  <p className="text-body font-bodycopy leading-tight mb-2">
                    Want to know as soon as we launch Parts 2 & 3?
                  </p>
                  <p className="text-body font-bodycopy mb-4">Sign up for updates below!</p>
                  <Button
                    onClick={openModal}
                    variant="background"
                    className="mx-auto mt-3 flex justify-center gap-2 font-bold"
                  >
                    <MailIcon className="w-6 h-6" />
                    Get Updates
                  </Button>
                  {notifyModal}
                </div>
              ) : null}
            </aside>
          </section>
          <section>
            {course.fields.samples?.length ? (
              <FullWidthSection
                bgColor="bg-gradient-to-tr from-bt-teal-dark to-bt-teal-light dark:to-bt-teal-light/30"
                className="my-6 md:my-10 rounded-3xl shadow-inner"
              >
                <section id="samples" className="flex flex-col items-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-white text-center">Watch Some Samples</h2>
                  <p className="font-bodycopy text-center text-md leading-snug md:text-lg text-white/80 mt-1 px-4">
                    We&apos;ve pulled out a few clips to give you a better idea of what to expect in the course
                  </p>
                  <div className="mt-6 flex w-full max-w-screen-xl gap-3 overflow-x-auto px-12 pb-12 pt-4 md:grid md:grid-cols-3 snap-x snap-mandatory">
                    {course.fields.samples.map((sample, index) => (
                      <button
                        key={sample.sys.id}
                        className="hover:scale-[103%] duration-200 aspect-w-9 aspect-h-16 relative block min-w-full overflow-hidden rounded-2xl shadow-sm hover:shadow-xl md:w-full snap-center"
                        onClick={() => {
                          setVideoForModal(sample);
                          mpPlaySample(sample);
                        }}
                      >
                        {sample.fields.thumbnail?.fields.file.url ? (
                          <Image
                            src={sample.fields.thumbnail.fields.file.url}
                            alt={`Course Sample ${index + 1}`}
                            width="540"
                            height="960"
                            className="object-cover"
                            loader={contentfulImageLoader}
                          />
                        ) : (
                          <VideoThumbnail
                            muxToken={tokens.sample[sample.fields.video?.signedPlaybackId ?? '']?.portrait ?? ''}
                            playbackId={sample.fields.video?.signedPlaybackId ?? ''}
                            alt={`${sample.fields.internalName}`}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-transparent" />
                        <div className="flex-col items-center justify-center bg-gray-700 bg-opacity-25 text-white drop-shadow-lg filter flex p-4">
                          <PlayIcon className="h-12 w-12 md:h-20 md:w-20" />
                        </div>
                        <div className="flex items-end text-white p-4 text-left">
                          <span className="text-lg md:text-2xl font-bold leading-tight">
                            {sample.fields.displayName ?? 'Play Sample'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </FullWidthSection>
            ) : (
              <></>
            )}
            {course.fields.chapters?.length ? (
              <FullWidthSection bgColor="bg-gradient-to-tr from-bt-orange-darker/60 via-bt-teal/80 to-bt-orange/80 rounded-3xl text-white">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center">Course Breakdown</h2>
                <div className="divide-y divide-white/20 mt-6">
                  {course.fields.chapters.map((chapter, index) => (
                    <div key={chapter.sys.id} className="relative py-8 grid md:grid-cols-3">
                      <div className="max-w-sm md:sticky md:top-40 h-fit">
                        <span className="text-sm tracking-widest text-white/70 uppercase font-bodycopy mb-0.5 block">
                          Chapter {index + 1}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-bold text-white/90 leading-tight mb-3 pr-1">
                          {chapter.fields.title}
                        </h3>
                      </div>
                      <div className="col-span-2 space-y-4">
                        {chapter.fields.lessons?.map((lesson) => (
                          <div
                            key={lesson.sys.id}
                            className="bg-white/80 dark:bg-black/40 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 md:gap-5 items-start lg:items-center"
                          >
                            <div className="w-full sm:w-40 md:w-40 lg:w-80 shrink-0">
                              <Card
                                innerClassName="filter-none rounded-lg"
                                imageUrl={
                                  lesson.fields.video?.fields.thumbnail?.fields.file.url ??
                                  `https://image.mux.com/${
                                    lesson.fields.video?.fields.video?.signedPlaybackId
                                  }/thumbnail.jpg?token=${
                                    tokens.image[lesson.fields.video?.fields.video?.signedPlaybackId ?? '']
                                  }`
                                }
                                imageSizes="(max-width: 768px) 100vw, 25vw"
                              />
                            </div>
                            <div className="flex flex-col justify-between">
                              <h4 className=" text-black/80 dark:text-white font-bold mb-1 text-md leading-tight md:text-lg lg:text-2xl">
                                {lesson.fields.title}
                              </h4>
                              {lesson.fields.description ? (
                                <p className="font-bodycopy text-sm md:text-md lg:text-[15px] text-black/60 dark:text-white/80 leading-normal max-w-sm mb-2 md:mb-4">
                                  {lesson.fields.description}
                                </p>
                              ) : null}
                              {lesson.fields.video?.fields.video?.duration ? (
                                <div className="flex items-center gap-1 text-black/40 dark:text-white/60 font-bodycopy text-xs font-bold">
                                  <ClockIconSolid className="w-3 h-3 md:w-4 md:h-4" />
                                  <span>{formatDuration(lesson.fields.video.fields.video.duration, 'mm:ss')}</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </FullWidthSection>
            ) : null}
            <FullWidthSection bgColor="bg-gradient-to-tl from-bt-teal-dark to-bt-teal-light dark:to-bt-teal-light/30 rounded-3xl my-10">
              <section id="meet-your-teacher" className="mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                  Meet Your Instructor
                  {course.fields.creator?.sys.contentType.sys.id === 'creatorTeam' ? 's' : ''}
                </h2>
                <CreatorCard creator={course.fields.creator} />
              </section>
            </FullWidthSection>
          </section>
          <div
            className={`${
              heroInView || sidebarInView ? 'hidden' : 'fixed'
            } isolate z-20 bottom-0 left-0 right-0 not-sr-only shadow-md bg-bt-background-light/90 dark:bg-gray-800/90 backdrop-blur-sm backdrop-saturate-150 border-t border-bt-teal-ultraLight/20`}
          >
            <div className="flex justify-between items-center p-4 gap-2 max-w-screen-xl mx-auto">
              <div>
                <p className="text-md md:text-xl leading-tight font-bold mb-1 dark:text-white">{course.fields.title}</p>
                <p className="text-sm font-bodycopy text-bt-teal dark:text-bt-teal-light leading-none">
                  with {course.fields.creator?.fields.name}
                </p>
              </div>
              <div className="md:flex gap-4 hidden">
                {shouldShowSubscriptionTreatment(user) ? null : (
                  <CoursePrice variant="headline6" courseId={course.sys.id} price={course.fields.price ?? 0} />
                )}
                <CourseCTAButton buttonProps={{ className: 'rounded-full' }} course={course} buttonLocation="footer" />
              </div>
              <div className="flex flex-col gap-1 md:hidden">
                <CourseCTAButton
                  buttonProps={{
                    size: 'extraExtraSmall',
                    className: 'rounded-full whitespace-nowrap',
                  }}
                  course={course}
                  buttonLocation="footer"
                />
              </div>
            </div>
          </div>
        </main>
        <Modal
          showCloseButton
          removeLineHeight
          open={Boolean(videoForModal && videoForModal.fields.video?.signedPlaybackId)}
          onClose={() => setVideoForModal(undefined)}
        >
          {videoForModal && (
            <VideoPlayer
              muxVideo={videoForModal}
              muxToken={{
                video: tokens.video[videoForModal.fields.video?.signedPlaybackId ?? ''],
                thumbnail: tokens.sample[videoForModal.fields.video?.signedPlaybackId ?? ''].landscape,
                storyboard: tokens.storyboard[videoForModal.fields.video?.signedPlaybackId ?? ''],
              }}
              autoPlay
            />
          )}
        </Modal>
      </div>
    );
    /* END DEFAULT CMP */
  };

  return (
    <Layout
      title={course?.fields.title ?? 'Course Details'}
      description="Bright Trip"
      fullBleed
      transparentHeader={heroInView}
      openGraph={buildCourseOpenGraph(course)}
      twitter={{
        cardType: 'summary_large_image',
      }}
    >
      {router.isFallback && <p>Loading course...</p>}
      {course ? (
        renderCMPLayout(course)
      ) : !router.isFallback ? (
        <div className="mx-auto mt-12 flex max-w-lg flex-col gap-8 text-center">
          <Text As="p" variant="subtitle1" className="text-gray-500">
            {"Hmm... this course doesn't seem to exist"}
          </Text>
          <Link href="/courses">
            <Button>View Library</Button>
          </Link>
        </div>
      ) : (
        <></>
      )}
    </Layout>
  );
};

export default CourseDetailsPage;
