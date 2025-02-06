import Banner from 'components/Banner';
import { add } from 'date-fns';
import { InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useInView } from 'react-intersection-observer';
import appConfig from '../../appConfig';
import { DurationBadge } from '../../components/Badges';
import Card from '../../components/Card';
import { PremiumBadge } from '../../components/Card/Badges';
import { BottomRight } from '../../components/Card/ContentAligners';
import CourseCard from '../../components/Card/CourseCard';
import CardCarousel from '../../components/CardCarousel';
import ComingSoonCourse from '../../components/ComingSoonCourse';
import ContinueWatching from '../../components/ContinueWatching';
import FullPageHero from '../../components/FullPageHero';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import CourseThemeGrid from '../../components/Pages/CourseLibrary/CourseThemeGrid';
import MeetCreatorCard, { MeetCreatorData } from '../../components/Pages/CourseLibrary/MeetCreatorCard';
import FeaturedGuideSection from '../../components/PageSections/FeaturedGuide';
import FullWidthSection from '../../components/PageSections/FullWidthSection';
import SectionWithMargin from '../../components/PageSections/SectionWithMargin';
import { SectionDivider } from '../../components/SectionDivider';
import { SectionHeading } from '../../components/SectionHeading';
import Text from '../../components/Text';
import contentfulClient from '../../contentful/contentfulClient';
import { useUserDataContext } from '../../hooks/useUserDataContext';
import {
  ContentfulCourseFields,
  ContentfulCreatorFields,
  ContentfulMuxVideoFields,
  ContentfulPlaylistFields,
  Course,
} from '../../models/contentful';
import { FaunaOrderSource } from '../../models/fauna';
import { formatDuration } from '../../utils';
import { getLessonThumbnailURL } from '../../utils/courses';
import {
  CourseDurationsMap,
  getDisplayDurationsForAllCourses,
  getDurationsForVideosFromFile,
} from '../../utils/courses.server';
import { isFutureCourse } from '../../utils/dates';
import {
  getMuxTokensForCoursePlayer,
  getMuxVideoTokenForSignedPlaybackId,
  getTokensForAllTrailers,
} from '../../utils/tokens';

export const getStaticProps = async () => {
  const response = await contentfulClient.getEntries<ContentfulCourseFields>({
    content_type: 'course',
    include: 2,
  });

  const featuredCourses = appConfig.library.featuredCourses.map((id) =>
    response.items.find((course) => course.sys.id === id)
  ) as Course[];

  const themeSections = appConfig.library.themeSections.map((section) => {
    const courses = section.courses.map((id) => response.items.find((course) => course.sys.id === id)) as Course[];
    return {
      ...section,
      courses,
    };
  });

  const { items: meetOurCreatorsData } = await contentfulClient.getEntries<
    Pick<ContentfulCreatorFields, 'featureImage' | 'slug' | 'name' | 'hero' | 'meetCreatorImage'>
  >({
    content_type: 'creator',
    select: 'sys.id,fields.featureImage,fields.slug,fields.name,fields.hero,fields.meetCreatorImage',
    'sys[id]': appConfig.library.meetOurCreators.join(','),
  });

  const meetOurCreators = appConfig.library.meetOurCreators.reduce((data, id) => {
    const matchingCreator = meetOurCreatorsData.find((creator) => creator.sys.id === id);
    if (!matchingCreator) return data;
    data.push({
      creatorName: matchingCreator.fields.name ?? '',
      slug: matchingCreator.fields.slug,
      imagePath:
        matchingCreator.fields.meetCreatorImage?.fields.file.url ??
        matchingCreator.fields.featureImage?.fields.file.url ??
        matchingCreator.fields.hero?.fields.file.url ??
        '',
    });
    return data;
  }, [] as MeetCreatorData[]);

  const { items: allComingSoonCourses } = await contentfulClient.getEntries<ContentfulCourseFields>({
    content_type: 'course',
    'sys.id[in]': appConfig.library.comingSoonCourses.join(),
    include: 10,
  });

  const comingSoonCourses = allComingSoonCourses.filter((course) => isFutureCourse(course));

  const trailerTokens = await getTokensForAllTrailers();
  const courseDurations: CourseDurationsMap = await getDisplayDurationsForAllCourses();

  const { items: playlistData } = await contentfulClient.getEntries<ContentfulPlaylistFields>({
    content_type: 'playlist',
    'sys.id': '1XgJ696fKzZ3GseoiamZZx', // map explainers
    include: 10,
  });

  const playlistDurations = getDurationsForVideosFromFile(playlistData[0]);
  const playlistImageTokens = getMuxTokensForCoursePlayer(playlistData[0] as Course);

  const featuredPlaylist = {
    item: playlistData[0],
    durationsMap: playlistDurations,
    imageTokens: playlistImageTokens,
  };

  // Sizzle video data fetching
  const sizzleVideoEntry = await contentfulClient.getEntry<ContentfulMuxVideoFields>('40js2QlXGfEyFmeeYwnkTf');
  const sizzleVideoTokens = getMuxVideoTokenForSignedPlaybackId(sizzleVideoEntry.fields.video?.signedPlaybackId ?? '', {
    time: sizzleVideoEntry.fields.thumbnailTimecode ?? 0,
  });

  // Featured Travel Guide
  const featuredGuide = response.items.find((course) => course.sys.id === appConfig.library.featuredGuide) ?? null;

  // Final props for page
  return {
    props: {
      featuredCourses,
      comingSoonCourses,
      meetOurCreators,
      themeSections,
      trailerTokens,
      courseDurations,
      featuredPlaylist,
      sizzleVideoEntry,
      sizzleVideoTokens,
      featuredGuide,
    },
    revalidate: 60,
  };
};

export type CategoryValue = 'All' | 'Cities' | 'Filmmaking' | 'Culture';
export type SortValue = 'newest' | 'nameAscending' | 'nameDescending';

function CourseLibraryPage({
  featuredCourses,
  comingSoonCourses,
  themeSections,
  meetOurCreators,
  trailerTokens,
  courseDurations,
  featuredPlaylist,
  sizzleVideoEntry,
  sizzleVideoTokens,
  featuredGuide,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { user } = useUserDataContext();
  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.05,
  });

  const router = useRouter();
  const [, setCookie, removeCookie] = useCookies();

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
      setCookie('s', JSON.stringify(source), {
        path: '/',
        // needs to be lax
        sameSite: 'lax',
        httpOnly: false,
        expires: add(new Date(), { years: 1 }),
      });
    }
  }, [router.query, setCookie, removeCookie]);

  const [primary, secondaryTop, secondaryBottom] = featuredCourses;

  const themeSectionToShow = themeSections[0];
  const showContinueWatching = user;
  const hideMeetCreators = user && user.subscribed;

  return (
    <Layout title="Course Library" description="Bright Trip" fullBleed transparentHeader={heroInView}>
      <FullPageHero
        ref={heroRef}
        video={{
          muxVideo: sizzleVideoEntry,
          muxTokens: sizzleVideoTokens,
        }}
        height="min-h-[65vh]"
        overlayStyle="bg-gradient-to-tl from-bt-teal via-bt-teal-light/30 to-black/10"
        secondaryOverlayStyle="bg-gradient-to-bl from-black/70 via-transparent to-bt-orange/40"
        mainContent={
          <div className={`flex flex-col gap-1 items-center -mt-12 ${appConfig.banner.isActive && '-mt-24'}`}>
            <h1 className="font-bold text-white text-5xl md:text-6xl">Travel Smarter</h1>
            <p className="max-w-xs md:max-w-full leading-tight font-bold text-bodySmall md:text-subtitle1 text-white">
              Beautiful travel courses from your favorite creators
            </p>
          </div>
        }
      />
      <div
        className={`relative -top-[100px] -mb-[100px] sm:-top-[120px] sm:-mb-[100px] z-20 mx-auto max-w-screen-md ${
          appConfig.banner.isActive && '-top-[120px] -mb-[120px] sm:-top-[160px] sm:-mb-[160px]'
        }`}
      >
        {appConfig.banner.isActive ? (
          <div className="md:rounded-tl-xl md:rounded-tr-xl overflow-hidden">
            <Banner title={appConfig.banner.title} subtitle={appConfig.banner.subtitle} />
          </div>
        ) : // <MusicbedBanner />
        null}
        <div
          className={`grid grid-cols-2 gap-4 bg-white dark:bg-gray-700 md:rounded-bl-xl md:rounded-br-xl p-4 shadow-xl ${
            !appConfig.banner.isActive && 'md:rounded-xl'
          }`}
        >
          <Link href="/destinations" className="group hover:scale-[102%] transition-all duration-200">
            <Card imageUrl="/images/destinations-card.jpg" imageSizes="50vw, 620px">
              <div className="absolute inset-0 bg-gradient-to-br from-bt-teal via-black to-bt-orange opacity-30" />
              <div className="relative text-white font-bold text-xl text-center leading-none md:text-4xl grid place-content-center h-full drop-shadow-md group-hover:scale-105 duration-200">
                Learn about a place
              </div>
            </Card>
          </Link>
          <Link href="/skills" className="group hover:scale-[102%] transition-all duration-200">
            <Card imageUrl="/images/skills-card.jpg" imageSizes="50vw, 620px">
              <div className="absolute inset-0 bg-gradient-to-bl from-bt-teal via-black to-bt-orange opacity-30" />
              <div className="relative text-white font-bold text-xl text-center leading-none md:text-4xl grid place-content-center h-full drop-shadow-md group-hover:scale-105 duration-200">
                Learn a travel skill
              </div>
            </Card>
          </Link>
        </div>
      </div>
      {showContinueWatching ? (
        <SectionWithMargin>
          <ContinueWatching trailerTokens={trailerTokens} courseDurations={courseDurations} />
        </SectionWithMargin>
      ) : null}
      {featuredGuide && (
        <FullWidthSection
          bgColor="bg-gradient-to-tr from-transparent to-bt-teal"
          imageURL={featuredGuide.fields.hero?.fields.file.url}
        >
          <FeaturedGuideSection course={featuredGuide} tokens={trailerTokens[featuredGuide.sys.id]} />
        </FullWidthSection>
      )}
      <SectionWithMargin>
        <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-300">New Releases</h2>
        <div className="mb-12 flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:grid-rows-2">
          {primary && (
            <CourseCard
              className="col-span-2 row-span-2 rounded-md"
              course={primary}
              priorityLoading
              imageSizes="(max-width: 640px) 100vw, (max-width: 1280px) 66vw, 820px"
              cardContent={(c) => <PremiumBadge course={c} />}
            />
          )}
          {secondaryTop && (
            <CourseCard
              course={secondaryTop}
              imageSizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 400px"
              cardContent={(c) => <PremiumBadge course={c} />}
            />
          )}
          {secondaryBottom && (
            <CourseCard
              course={secondaryBottom}
              imageSizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 400px"
              cardContent={(c) => <PremiumBadge course={c} />}
            />
          )}
        </div>
      </SectionWithMargin>
      {hideMeetCreators ? (
        <></>
      ) : (
        <FullWidthSection
          bgColor="bg-gradient-to-tr from-bt-teal-dark to-bt-teal-light"
          secondaryOverlay={
            <>
              <div className="absolute inset-0 filter mix-blend-overlay opacity-70">
                <Image className="object-cover" src="/images/teal-bg.png" alt="" fill sizes="100vw" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tl from-black/30 via-white/10 to-bt-orange/80" />
            </>
          }
        >
          <h2 className="text-4xl font-bold mb-6 mx-auto text-white/90 text-center">
            Learn from your favorite Creators
          </h2>
          <div className="grid grid-cols-2 md:flex md:items-center gap-4">
            {meetOurCreators.map((creator) => (
              <MeetCreatorCard
                key={creator.slug}
                creatorName={creator.creatorName}
                imagePath={creator.imagePath}
                slug={creator.slug}
              />
            ))}
          </div>
        </FullWidthSection>
      )}

      {featuredPlaylist.item && (
        <>
          <SectionWithMargin>
            <SectionDivider />
          </SectionWithMargin>
          <SectionWithMargin>
            <CardCarousel
              title={featuredPlaylist.item.fields.title}
              subtitle="Quick map breakdowns of some of our favorite spots"
              containerStyles="pb-10 px-2"
              items={(
                featuredPlaylist.item.fields.chapters?.flatMap((ch) => ch.fields.lessons?.map((l) => l)) ?? []
              ).map((lesson) => {
                if (!lesson) return null;
                const lessonAssetId = lesson?.fields.video?.fields.video?.assetId ?? '';
                const imageURL = getLessonThumbnailURL(
                  lesson,
                  featuredPlaylist.imageTokens.image[lesson?.fields.video?.fields.video?.signedPlaybackId ?? '']
                );
                return (
                  <Link
                    key={lesson?.sys.id}
                    href={`/playlists/${featuredPlaylist.item.fields.slug}?v=${lesson?.sys.id}`}
                    className={`border-2 shadow-md border-transparent hover:shadow-xl hover:scale-[103%] cursor-pointer flex-shrink-0 block w-small-card md:w-card isolate bg-bt-background-light dark:bg-gray-800 rounded-xl overflow-hidden p-2 transition-all duration-200`}
                  >
                    <Card
                      key={lesson?.sys.id}
                      imageUrl={imageURL}
                      innerClassName="p-1 rounded-md filter-none border border-black/10"
                      imageSizes={`(max-width: 640px) 50vw, (max-width: 768px) 66vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 400px`}
                    >
                      <BottomRight>
                        <div className="relative">
                          <DurationBadge>
                            {formatDuration(featuredPlaylist.durationsMap[lessonAssetId]?.duration ?? 0, 'mm:ss')}
                          </DurationBadge>
                        </div>
                      </BottomRight>
                    </Card>
                    <div className="flex flex-col px-0.5 pt-2 pb-1">
                      <span className="text-bodySmall md:text-body font-bold leading-tight text-gray-800 dark:text-gray-300">
                        {lesson?.fields.title}
                      </span>
                      {lesson?.fields.video?.fields.creator?.fields.name ? (
                        <span className="text-[12px] md:text-bodySmall font-bodycopy text-bt-teal dark:text-bt-teal-light leading-tight mt-1 md:mt-0">
                          {lesson?.fields.video?.fields.creator?.fields.name}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            />
          </SectionWithMargin>
        </>
      )}
      {comingSoonCourses.length > 0 ? (
        <SectionWithMargin>
          <Text As="h2" variant="sectionTitleLeftBorderCompact" className="my-5">
            Coming Soon
          </Text>
          {comingSoonCourses.map((course) => (
            <ComingSoonCourse key={course.sys.id} course={course} />
          ))}
        </SectionWithMargin>
      ) : null}
      <SectionWithMargin>
        <SectionDivider />
      </SectionWithMargin>
      <SectionWithMargin>
        <CourseThemeGrid
          key={themeSectionToShow.title}
          courses={themeSectionToShow.courses}
          title={<SectionHeading title={themeSectionToShow.title} description={themeSectionToShow.subtitle} />}
          cardContent={(course) => <PremiumBadge course={course} />}
        />
      </SectionWithMargin>
      <FullWidthSection
        bgColor="bg-gradient-to-tr from-bt-green via-bt-green to-white/30 dark:to-black/30"
        secondaryOverlay={
          <>
            <div className="absolute inset-0 filter mix-blend-luminosity opacity-70">
              <Image className="object-cover rotate-180" src="/images/teal-bg.png" alt="" fill sizes="100vw" />
            </div>
          </>
        }
      >
        <SectionWithMargin className="flex flex-col items-center max-w-sm text-center">
          <h2 className="text-white text-3xl font-bold">Want more?</h2>
          <p className="font-bodycopy text-white/80 mt-1 leading-snug mb-5">
            Our catalog of premium courses, travel guides, and documentaries is always growing.
          </p>
          <Link href="/search">
            <button className="px-6 py-2 rounded-full bg-bt-orange text-white font-bold">Explore Everything</button>
          </Link>
        </SectionWithMargin>
      </FullWidthSection>
      <PromoModal />
    </Layout>
  );
}

export default CourseLibraryPage;

const PromoModal = () => {
  const PROMO_KEY = `${appConfig.promoModal.localStorageKey}-promo-modal-dismissed`;
  const [showModal, setShowModal] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem(PROMO_KEY)) {
      const lsValue = window.localStorage.getItem(PROMO_KEY) ?? 'false';
      return JSON.parse(lsValue) === false;
    }
    return appConfig.promoModal.isActive;
  });

  const dismissModal = () => {
    setShowModal(false);
    localStorage.setItem(PROMO_KEY, 'true');
  };

  return (
    <Modal open={showModal} onClose={dismissModal} removeLineHeight fitToScreen showCloseButton>
      <Image
        onClick={dismissModal}
        src={appConfig.promoModal.image.src}
        alt={appConfig.promoModal.image.alt}
        width={appConfig.promoModal.image.width}
        height={appConfig.promoModal.image.height}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
    </Modal>
  );
};
