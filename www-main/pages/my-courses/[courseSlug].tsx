import { getSession } from '@auth0/nextjs-auth0';
import { Disclosure, Tab, Transition } from '@headlessui/react';
import { BookmarkIcon, ChevronRightIcon, AnnotationIcon } from '@heroicons/react/outline';
import { BookmarkIcon as BookmarkedIcon } from '@heroicons/react/solid';
import Card from 'components/Card';
import Modal from 'components/Modal';
import CourseResources from 'components/Pages/CoursePlayer/CourseResources';
import Select from 'components/Select';
import TextArea from 'components/TextArea';
import { Entry, EntryCollection } from 'contentful';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Cookies, useCookies } from 'react-cookie';
import appConfig from '../../appConfig';
import Button from '../../components/Button';
import Layout, { DEFAULT_TWITTER } from '../../components/Layout';
import CreatorLockup from '../../components/Pages/CoursePlayer/CreatorLockup';
import { EndScreenCompleted } from '../../components/Pages/CoursePlayer/EndScreenCompleted';
import { EndScreenWithNextVideo } from '../../components/Pages/CoursePlayer/EndScreenWithNextVideo';
import { FutureCourseOverlay } from '../../components/Pages/CoursePlayer/FutureCourseOverlay';
import LessonButton from '../../components/Pages/CoursePlayer/LessonButton';
import { NewVersionBanner } from '../../components/Pages/CoursePlayer/NewVersionBanner';
import ProductGuide from '../../components/Pages/CoursePlayer/ProductGuide';
import { UnpublishedCourseBanner } from '../../components/Pages/CoursePlayer/UnpublishedCourseBanner';
import { BlockerMap, VideoBlocker } from '../../components/Pages/CoursePlayer/VideoBlocker';
import { VideoInterstitial } from '../../components/Pages/CoursePlayer/VideoInterstitial';
import Text from '../../components/Text';
import VideoPlayer from '../../components/VideoPlayer';
import ZionAdgCalloutSection from '../../components/ZionAdgCalloutSection';
import contentfulClient, { contentfulPreviewClient } from '../../contentful/contentfulClient';
import courseNamesMap from '../../courseNames';
import { getUserByEmail, getUserProgressForCourse, isUserEnrolledInCourse } from '../../fauna/functions';
import { useCountdown } from '../../hooks/useCountdown';
import * as mpClient from '../../mixpanel/client';
import { ContentfulCourseFields, ContentfulCreatorFields, ContentfulCreatorTeamFields } from '../../models/contentful';
import { FaunaUserData } from '../../models/fauna';
import { getLessonThumbnailURL } from '../../utils/courses';
import { getDurationsForVideosFromFile, VideoDurationMap } from '../../utils/courses.server';
import { isFutureCourse } from '../../utils/dates';
import { EnrollmentType, SYSTEM_ORDER_IDS } from '../../utils/enrollment';
import { buildCourseOpenGraph } from '../../utils/openGraph';
import { getMuxTokensForCoursePlayer } from '../../utils/tokens';
import { createCourseThumbnailURL, getBaseName } from '../../utils/ui-helpers';

const getProgressCookieName = (courseId: string) => `bt-c-${courseId}-progress`;
const getCompletedCookieName = (courseId: string) => `bt-c-${courseId}-completed`;
const getBookmarkCookieName = (courseId: string) => `bt-c-${courseId}-bookmarks`;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context.req, context.res);
  const {
    params: { courseSlug } = {},
    query: { mode },
  } = context;

  const userIsEnrolledInAllCourses = session?.user['https://brighttrip.com/enrolledInAllCourses'];
  const userIsInternal = session?.user['https://brighttrip.com/isInternal'];

  const redirect = {
    redirect: {
      destination: `/my-courses`,
      permanent: false,
    },
  };

  if (!courseSlug) {
    return redirect;
  }

  if (String(mode) === 'preview' && !userIsInternal) {
    return redirect;
  }

  let isPreview = false;
  let courseResponse: EntryCollection<ContentfulCourseFields>;
  const reqOptions = {
    'fields.slug': String(courseSlug),
    content_type: 'course',
    include: 10,
  };

  if (String(mode) === 'preview' && userIsInternal) {
    isPreview = true;
    courseResponse = await contentfulPreviewClient.getEntries<ContentfulCourseFields>(reqOptions);
  } else {
    courseResponse = await contentfulClient.getEntries<ContentfulCourseFields>(reqOptions);
  }

  if (courseResponse.items.length === 0) {
    return redirect;
  }

  const course = courseResponse.items[0];
  const [userIsEnrolledInThisCourse, orderId] = await isUserEnrolledInCourse(session?.user.email, course.sys.id);

  const courseIsFree = Number(course.fields.price) === 0;
  const courseHasPrice = Number(course.fields.price) > 0;
  const courseIsInSubscription = appConfig.subscriptionCourses.includes(course.sys.id);
  const courseIsPurchasable = courseHasPrice && !courseIsInSubscription;

  if (courseIsPurchasable && !userIsEnrolledInThisCourse && !userIsEnrolledInAllCourses) {
    return {
      redirect: {
        destination: `/${getBaseName(course.sys.id)}/${course.fields.slug}`,
        permanent: false,
      },
    };
  }

  const getEnrollmentType = (orderId: string) => {
    if (!orderId) return '';
    if ((Object.values(SYSTEM_ORDER_IDS) as readonly string[]).includes(orderId)) return orderId;
    return 'purchase';
  };

  let user: FaunaUserData | null = null;
  if (session?.user.email) {
    user = await getUserByEmail(session.user.email);
  }

  const videoAssets = getDurationsForVideosFromFile(course);

  let completedLessons: string[];
  let videoProgress: Record<string, number>;
  let bookmarkedLessons: string[] = [];

  if (!session?.user.email) {
    const cookies = new Cookies(context.req.cookies);
    completedLessons = cookies.get(getCompletedCookieName(course.sys.id)) ?? [];
    videoProgress = cookies.get(getProgressCookieName(course.sys.id)) ?? {};
    bookmarkedLessons = cookies.get(getBookmarkCookieName(course.sys.id)) ?? [];
  } else {
    const progressData = await getUserProgressForCourse(course.sys.id, session.user.email);
    completedLessons = progressData.completedLessons;
    videoProgress = progressData.videoProgress;
    bookmarkedLessons = progressData.bookmarkedLessons;
  }

  const getBlockers = (): BlockerMap => {
    if (courseIsFree) {
      if (user) {
        return {
          videos: null,
          resources: null,
        };
      } else {
        return {
          videos: { type: 'user', message: 'Sign in to unlock all videos' },
          resources: { type: 'user', message: 'Sign up for a free Bright Trip account to unlock resources' },
        };
      }
    }
    if (courseIsInSubscription) {
      if (user) {
        if (user.subscribed || userIsEnrolledInThisCourse || userIsEnrolledInAllCourses) {
          return {
            videos: null,
            resources: null,
          };
        } else {
          return {
            videos: { type: 'subscription', message: 'Subscribe to unlock all videos' },
            resources: null,
          };
        }
      } else {
        return {
          videos: { type: 'subscription', message: 'Subscribe to unlock all videos' },
          resources: { type: 'user', message: 'Sign up for a free Bright Trip account to unlock resources' },
        };
      }
    }
    if (courseHasPrice) {
      if (user) {
        if (userIsEnrolledInThisCourse || userIsEnrolledInAllCourses) {
          return {
            videos: null,
            resources: null,
          };
        } else {
          return {
            videos: { type: 'purchase', message: 'Purchase this course to unlock all videos' },
            resources: { type: 'purchase', message: 'Purchase this course to unlock resources' },
          };
        }
      } else {
        return {
          videos: { type: 'purchase', message: 'Purchase this course to unlock all videos' },
          resources: { type: 'user', message: 'Purchase this course to unlock resources' },
        };
      }
    }
    throw new Error('Unknown access type');
  };

  return {
    props: {
      user,
      course,
      tokens: getMuxTokensForCoursePlayer(course),
      videoAssets,
      completedLessons,
      bookmarkedLessons,
      videoProgress: videoProgress ?? {},
      enrollmentType: getEnrollmentType(orderId),
      numberOfUnlockedLessons: appConfig.unlockedLessons[course.sys.id] ?? 1,
      isPreview,
      blockers: getBlockers(),
    },
  };
};

const syncBookmarkedLessons = (
  courseId: string,
  bookmarks: Set<string>,
  user: FaunaUserData | null,
  setCookie: ReturnType<typeof useCookies>['1']
) => {
  if (user) {
    fetch('/api/course-progress', {
      method: 'PUT',
      body: JSON.stringify({
        courseId,
        data: {
          bookmarkedLessons: Array.from(bookmarks),
        },
      }),
    });
  } else {
    setCookie(getBookmarkCookieName(courseId), JSON.stringify(Array.from(bookmarks)), {
      path: '/',
      secure: false,
      httpOnly: false,
      sameSite: 'strict',
    });
  }
};

const syncCompletedLessons = (
  id: string,
  completedIds: Set<string>,
  user: FaunaUserData | null,
  setCookie: ReturnType<typeof useCookies>['1']
) => {
  if (user) {
    fetch('/api/course-progress', {
      method: 'PUT',
      body: JSON.stringify({
        courseId: id,
        data: {
          completedLessons: Array.from(completedIds),
        },
      }),
    });
  } else {
    setCookie(getCompletedCookieName(id), JSON.stringify(Array.from(completedIds)), {
      path: '/',
      secure: false,
      httpOnly: false,
      sameSite: 'strict',
    });
  }
};

const syncVideoProgress = (
  id: string,
  videoProgress: Record<string, number>,
  user: FaunaUserData | null,
  setCookie: ReturnType<typeof useCookies>['1']
) => {
  if (user) {
    fetch('/api/course-progress', {
      method: 'PUT',
      body: JSON.stringify({
        courseId: id,
        data: {
          videoProgress,
        },
      }),
    });
  } else {
    setCookie(getProgressCookieName(id), JSON.stringify(videoProgress), {
      path: '/',
      secure: false,
      httpOnly: false,
      sameSite: 'strict',
    });
  }
};

const calculateProgressBarWidth = (
  videoId: string,
  assetId: string,
  videoProgress: Record<string, number>,
  videoAssets: Record<string, { duration: number }>
) => {
  const duration = videoAssets[assetId]?.duration;
  const progress = videoProgress[videoId];

  if (!duration || !progress) return 0;

  return Math.round((progress / duration) * 100);
};

interface CoursePlayerPageProps {
  user: FaunaUserData;
  course: Entry<ContentfulCourseFields>;
  tokens: ReturnType<typeof getMuxTokensForCoursePlayer>;
  videoAssets: VideoDurationMap;
  completedLessons: string[];
  bookmarkedLessons: string[];
  videoProgress: Record<string, number>;
  enrollmentType: EnrollmentType;
  numberOfUnlockedLessons: number;
  isPreview: boolean;
  blockers: BlockerMap;
}

export default function CoursePlayerPage({
  user,
  course,
  tokens,
  videoAssets,
  completedLessons,
  bookmarkedLessons,
  videoProgress,
  enrollmentType,
  numberOfUnlockedLessons,
  isPreview,
  blockers,
}: CoursePlayerPageProps) {
  const router = useRouter();
  const [localCompletedLessons, setLocalCompletedLessons] = useState<Set<string>>(new Set(completedLessons));
  const lessons = useMemo(
    () => course.fields.chapters?.flatMap((chapter) => chapter.fields.lessons) ?? [],
    [course.fields.chapters]
  );
  const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
    const { v } = router.query;
    if (v) {
      const vIndex = lessons.findIndex((lesson) => lesson?.sys.id === String(v));
      return Boolean(blockers.videos) && vIndex > numberOfUnlockedLessons - 1 ? 0 : vIndex;
    }
    if (completedLessons.length > 0) {
      for (let i = 0; i < lessons.length; i += 1) {
        if (!completedLessons.includes(lessons?.[i]?.sys.id ?? '')) {
          return i;
        }
      }
    }
    return 0;
  });
  const [localBookmarks, setLocalBookmarks] = useState(new Set(bookmarkedLessons));
  const [localVideoProgress, setLocalVideoProgress] = useState(videoProgress);
  const [, setCookie] = useCookies();
  const [playbackRate, setPlaybackRate] = useState(1);

  const currentLesson = lessons[currentLessonIndex];
  const nextLesson = currentLessonIndex + 1 < lessons.length ? lessons[currentLessonIndex + 1] : null;
  const nextLessonImageUrl = nextLesson
    ? getLessonThumbnailURL(nextLesson, tokens.image[nextLesson.fields.video?.fields.video?.signedPlaybackId ?? ''])
    : null;
  const isLastLesson = currentLessonIndex === lessons.length - 1;
  const isLastUnlockedLesson = Boolean(blockers.videos) && currentLessonIndex === numberOfUnlockedLessons - 1;

  const { isRunning, start, reset, timeRemaining } = useCountdown(5, () => {
    if (isLastUnlockedLesson || isLastLesson) {
      return;
    }

    if (currentLessonIndex < lessons.length) {
      if (currentLesson?.sys.id) {
        const newCompletedLessons = localCompletedLessons;
        newCompletedLessons?.add(currentLesson.sys.id);
        setLocalCompletedLessons(newCompletedLessons);
        syncCompletedLessons(course.sys.id, newCompletedLessons, user, setCookie);
      }

      if (!isLastLesson) {
        setCurrentLessonIndex(currentLessonIndex + 1);
      }
    }
    reset();
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatusText, setFeedbackStatusText] = useState('');

  const handleClickLesson = (id: string) => {
    if (isRunning) {
      reset();
    }
    const indexToSet = lessons.findIndex((lesson) => lesson?.sys.id === id);
    setCurrentLessonIndex(indexToSet);
  };

  const handleBookmarkClick = () => {
    if (currentLesson) {
      const newBookmarks = new Set(localBookmarks);
      if (localBookmarks.has(currentLesson.sys.id)) {
        newBookmarks.delete(currentLesson.sys.id);
      } else {
        newBookmarks.add(currentLesson.sys.id);
      }
      setLocalBookmarks(newBookmarks);
      syncBookmarkedLessons(course.sys.id, newBookmarks, user, setCookie);

      try {
        mpClient.track(mpClient.Event.Bookmark, {
          courseId: course.sys.id,
          courseTitle: course.fields.title,
          lessonId: currentLesson.sys.id,
          lessonName: currentLesson.fields.title,
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleTrackVideoProgress = (secondsElapsed: number, videoId: string) => {
    const updatedVideoProgress = {
      ...localVideoProgress,
      [videoId]: secondsElapsed,
    };
    setLocalVideoProgress(updatedVideoProgress);
    syncVideoProgress(course.sys.id, updatedVideoProgress, user, setCookie);
  };

  const handleGiveFeedbackClick = () => {
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedbackStatusText('Submitting...');
    try {
      const response = await fetch('/api/give-feedback', {
        method: 'POST',
        body: JSON.stringify({
          message: feedbackText,
          metadata: {
            Course: course.fields.title,
            'Active Lesson': currentLesson?.fields.title ?? 'None',
            'Percent Complete': calculateProgressBarWidth(
              currentLesson?.fields.video?.sys.id ?? '',
              currentLesson?.fields.video?.fields.video?.assetId ?? '',
              localVideoProgress,
              videoAssets
            ),
            'Last Synced Timestamp': localVideoProgress[currentLesson?.fields.video?.sys.id ?? ''],
          },
        }),
      });
      if (!response.ok) {
        console.error('be error');
      } else {
        setTimeout(() => {
          setFeedbackStatusText('Submitted!');
        }, 1000);
        setTimeout(() => {
          setShowFeedbackModal(false);
          setFeedbackStatusText('');
          setFeedbackText('');
        }, 3000);
      }
    } catch (error) {
      console.error('fetch failed');
    }
  };

  const [trackedLesson, setTrackedLesson] = useState<number | null>(null);
  const mpTrackLessonPlay = () => {
    if (currentLessonIndex !== trackedLesson) {
      try {
        mpClient.track(mpClient.Event.LessonPlay, {
          lessonId: currentLesson?.sys.id ?? 'Unknown Lesson ID',
          lessonTitle: currentLesson?.fields.title ?? 'Unknown Lesson Title',
          courseId: course.sys.id,
          courseTitle: course.fields.title,
          type: enrollmentType,
        });
      } catch (e) {
        console.error(e);
      }
      setTrackedLesson(currentLessonIndex);
    }
  };

  const mpTrackLessonComplete = () => {
    try {
      mpClient.track(mpClient.Event.LessonComplete, {
        lessonId: currentLesson?.sys.id ?? 'Unknown Lesson ID',
        lessonTitle: currentLesson?.fields.title ?? 'Unknown Lesson Title',
        courseId: course.sys.id,
        courseTitle: course.fields.title,
        type: enrollmentType,
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (Object.keys(videoProgress).length === 0) {
      try {
        mpClient.track(mpClient.Event.CourseStart, {
          courseId: course.sys.id,
          courseTitle: course.fields.title,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [course.fields.title, course.sys.id, videoProgress]);

  useEffect(() => {
    if (currentLesson?.sys.id) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('v', currentLesson.sys.id);
      router.replace(newUrl, undefined, { shallow: true });
    }
    // TODO: figure out how to make `router` not re-run this effect everytime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson?.sys.id]);

  const archivedCourse = appConfig.archivedItems.find((archivedItem) => archivedItem.id === course.sys.id);
  const showNewVersionOfferBanner = archivedCourse && archivedCourse.upgradeTo;

  return (
    <Layout
      title={course.fields.title}
      description="My Courses"
      fullBleed
      openGraph={buildCourseOpenGraph(course)}
      twitter={DEFAULT_TWITTER}
      transparentHeader={isFutureCourse(course)}
    >
      {isFutureCourse(course) ? (
        <FutureCourseOverlay course={course} />
      ) : (
        <main className="isolate mx-auto max-w-screen-2xl items-start gap-4 p-6 md:grid md:grid-cols-12">
          {/* LESSON LIST SIDEBAR */}
          <div className="relative md:hidden w-full mb-4 z-50">
            <div className="text-center bg-gray-200 dark:bg-gray-950 shadow-inner mb-4 p-3 rounded-lg">
              <h1 className="text-lg font-bold leading-none text-gray-800 dark:text-white/80">{course.fields.title}</h1>
              {course.fields.creator?.fields.name && (
                <p className="text-sm font-bodycopy text-bt-teal dark:text-bt-teal-ultraLight mt-0">
                  with {course.fields.creator?.fields.name}
                </p>
              )}
            </div>
            <Select
              label="Choose a Lesson"
              selected={
                currentLesson
                  ? { id: currentLesson?.sys.id ?? '', name: currentLesson?.fields.title ?? '', disabled: true }
                  : { id: '', name: 'Choose a lesson...', disabled: true }
              }
              setSelected={(option) => handleClickLesson(option.id)}
              options={
                lessons && lessons.length
                  ? [{ id: '', name: 'Choose a lesson...', disabled: true }].concat(
                      lessons.map((lesson) => ({
                        id: lesson!.sys.id,
                        name: lesson!.fields.title,
                        disabled: lesson!.sys.id === currentLesson?.sys.id,
                      }))
                    )
                  : []
              }
            />
          </div>
          <div className="hidden md:flex isolate md:col-span-5 lg:col-span-4 xl:col-span-3 flex-col overflow-hidden gap-2 max-h-min">
            <Card
              imageUrl={createCourseThumbnailURL(course)}
              imageSizes="600px"
              innerClassName="rounded-lg shadow-none drop-shadow-none"
              className="shadow-none drop-shadow-none"
            />
            {Boolean(blockers.videos) && (
              <VideoBlocker blockers={blockers.videos} courseId={course.sys.id} nextLessonId={nextLesson?.sys.id} />
            )}

            <section>
              <Tab.Group defaultIndex={0}>
                <Tab.List className="flex items-baseline my-1 justify-between bg-gray-200 shadow-inner p-1 dark:bg-gray-950 rounded-xl">
                  <Tab
                    className={({ selected }) =>
                      `${
                        selected
                          ? 'bg-white dark:bg-bt-teal/40 text-bt-teal dark:text-white shadow-md'
                          : 'text-bt-teal-dark/50 dark:text-bt-background-light/40'
                      } px-4 py-1 rounded-lg`
                    }
                  >
                    <span className="text-md md:text-sm lg:text-md font-bold">Lessons</span>
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `${
                        selected
                          ? 'bg-white dark:bg-bt-teal/40 text-bt-teal dark:text-white shadow-md'
                          : 'text-bt-teal-dark/50 dark:text-bt-background-light/40'
                      } px-4 py-1 rounded-lg`
                    }
                  >
                    <span className="text-md md:text-sm lg:text-md font-bold">
                      Bookmarks{localBookmarks.size > 0 && ` (${localBookmarks.size})`}
                    </span>
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `${
                        selected
                          ? 'bg-white dark:bg-bt-teal/40 text-bt-teal dark:text-white shadow-md'
                          : 'text-bt-teal-dark/50 dark:text-bt-background-light/40'
                      } px-4 py-1 rounded-lg`
                    }
                  >
                    <span className="text-md md:text-sm lg:text-md font-bold">Resources</span>
                  </Tab>
                </Tab.List>
                <section className="bg-gray-200 dark:bg-gray-950 rounded-xl shadow-inner px-2 py-3 mt-3">
                  <Tab.Panels>
                    <div className="overflow-y-auto pr-2" style={{ maxHeight: '530px' }}>
                      <Tab.Panel>
                        {course.fields.chapters?.map((chapter) => (
                          <Disclosure key={chapter.sys.id} defaultOpen>
                            {({ open }) => (
                              <div className="relative flex flex-col gap-3 mb-2 last:mb-2 p-2 rounded-lg">
                                <Disclosure.Button className="flex items-center justify-between">
                                  <h3 className="text-sm font-bold text-left text-gray-800 dark:text-gray-300">
                                    {chapter.fields.title}
                                  </h3>
                                  <ChevronRightIcon
                                    className={`h-5 w-5 text-gray-800 dark:text-gray-300 ${
                                      open ? 'rotate-90 transform duration-150' : 'duration-150'
                                    }`}
                                  />
                                </Disclosure.Button>
                                <Disclosure.Panel>
                                  <Transition
                                    show={open}
                                    enter="transition-opacity delay-50 duration-400"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="transition-opacity duration-50"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                  >
                                    <div className="flex flex-col">
                                      {chapter.fields.lessons?.map((lesson) => (
                                        <LessonButton
                                          disabled={
                                            lessons.indexOf(lesson) >= numberOfUnlockedLessons &&
                                            Boolean(blockers.videos)
                                          }
                                          key={lesson.sys.id}
                                          currentLesson={currentLesson}
                                          lesson={lesson}
                                          completedLessons={localCompletedLessons}
                                          handleClickLesson={handleClickLesson}
                                          tokens={tokens}
                                          videoAssets={videoAssets}
                                          progress={calculateProgressBarWidth(
                                            lesson.fields.video?.sys.id ?? '',
                                            lesson.fields.video?.fields.video?.assetId ?? '',
                                            localVideoProgress,
                                            videoAssets
                                          )}
                                        />
                                      ))}
                                    </div>
                                  </Transition>
                                </Disclosure.Panel>
                              </div>
                            )}
                          </Disclosure>
                        ))}
                      </Tab.Panel>
                      <Tab.Panel className="text-center -mr-2">
                        <div className="flex flex-col gap-3">
                          {Array.from(localBookmarks).length > 0 ? (
                            Array.from(localBookmarks).map((bookmark) => {
                              const lesson = lessons.find((l) => l?.sys.id === bookmark);
                              return (
                                lesson && (
                                  <LessonButton
                                    key={bookmark}
                                    currentLesson={currentLesson}
                                    lesson={lesson}
                                    completedLessons={localCompletedLessons}
                                    handleClickLesson={handleClickLesson}
                                    tokens={tokens}
                                    videoAssets={videoAssets}
                                    progress={calculateProgressBarWidth(
                                      lesson.fields.video?.sys.id ?? '',
                                      lesson.fields.video?.fields.video?.assetId ?? '',
                                      localVideoProgress,
                                      videoAssets
                                    )}
                                  />
                                )
                              );
                            })
                          ) : (
                            <p className="pt-10 text-bodySmall text-gray-600 dark:text-gray-400 mb-12 px-4">
                              You haven&apos;t bookmarked any lessons yet
                            </p>
                          )}
                        </div>
                      </Tab.Panel>
                      <Tab.Panel className="-mr-2">
                        <CourseResources course={course} blockers={blockers} />
                      </Tab.Panel>
                    </div>
                  </Tab.Panels>
                </section>
              </Tab.Group>
            </section>
          </div>
          {/* VIDEO PLAYER AND UNDERNEATH CONTENT */}
          <div className="z-10 md:col-span-7 lg:col-span-8 xl:col-span-9 lg:mx-0 pl-1">
            {isPreview && <UnpublishedCourseBanner courseId={course.sys.id} />}
            {showNewVersionOfferBanner && <NewVersionBanner courseId={course.sys.id} />}
            <div
              className={`w-full overflow-hidden ${
                isPreview ? 'rounded-b-lg' : 'rounded-lg'
              } filter relative leading-[0]`}
            >
              {currentLesson && currentLesson.fields.video && (
                <VideoPlayer
                  onRateChange={(e) => setPlaybackRate((e.target as HTMLVideoElement).playbackRate)}
                  playbackRate={playbackRate}
                  autoPlay
                  muxToken={{
                    video: tokens.video[currentLesson.fields.video.fields.video?.signedPlaybackId ?? ''],
                    thumbnail: tokens.image[currentLesson.fields.video.fields.video?.signedPlaybackId ?? ''],
                    storyboard: tokens.storyboard[currentLesson.fields.video.fields.video?.signedPlaybackId ?? ''],
                  }}
                  playsInline
                  muxVideo={currentLesson.fields.video}
                  onProgressUpdate={handleTrackVideoProgress}
                  progress={videoProgress[currentLesson.fields.video.sys.id]}
                  duration={videoAssets[currentLesson.fields.video.fields.video?.assetId ?? '']?.duration}
                  onPlay={mpTrackLessonPlay}
                  onEnded={() => {
                    start();
                    mpTrackLessonComplete();
                  }}
                  dataFields={{
                    videoSeries: course.sys.id,
                    videoProducer: course.fields.creator?.sys.id,
                    enrollmentType,
                  }}
                />
              )}
              {currentLesson &&
                currentLesson.fields.video &&
                !currentLesson.fields.video.fields.video?.signedPlaybackId && (
                  <div className="absolute bottom-0 right-1/4 top-0 left-1/4 flex flex-col items-center justify-center gap-2">
                    <VideoInterstitial
                      blockers={{
                        type: 'unreleased',
                        message: `We're still hard at work on this video. Sign up below to get notified when it's ready!`,
                      }}
                      course={course}
                      nextLessonId={nextLesson?.sys.id}
                    />
                  </div>
                )}
              {/* END SCREEN */}
              {isRunning && (
                <div className="absolute z-20 bottom-0 top-0 w-full md:left-[10%] md:w-[80%] md:right-[10%] lg:left-1/4 lg:w-1/2 lg:right-1/4 flex flex-col items-center justify-center gap-2">
                  {isLastLesson ? (
                    <EndScreenCompleted
                      itemTitle={course.fields.title}
                      ctaText={
                        user.subscribed
                          ? 'Check out our full subscription catalog to find your next course.'
                          : 'Check out the rest of our catalog to find something to watch next.'
                      }
                      ctaButtonText="Find Your Next Course"
                      ctaHref={user.subscribed ? '/subscription' : '/store'}
                    />
                  ) : isLastUnlockedLesson ? (
                    <VideoInterstitial course={course} nextLessonId={nextLesson?.sys.id} blockers={blockers.videos} />
                  ) : (
                    <EndScreenWithNextVideo
                      text={`"${nextLesson?.fields.title}" will start in ${timeRemaining} seconds`}
                      imageUrl={nextLessonImageUrl}
                      onCancelClick={() => {
                        if (currentLesson?.sys.id) {
                          const newCompletedLessons = localCompletedLessons;
                          newCompletedLessons?.add(currentLesson.sys.id);
                          setLocalCompletedLessons(newCompletedLessons);
                          syncCompletedLessons(course.sys.id, newCompletedLessons, user, setCookie);
                        }
                        reset();
                      }}
                      onConfirmClick={() => {
                        if (currentLesson?.sys.id) {
                          const newCompletedLessons = localCompletedLessons;
                          newCompletedLessons?.add(currentLesson.sys.id);
                          setLocalCompletedLessons(newCompletedLessons);
                          syncCompletedLessons(course.sys.id, newCompletedLessons, user, setCookie);
                        }
                        if (nextLesson) {
                          handleClickLesson(nextLesson?.sys.id);
                        }
                        reset();
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            {/* UNDERNEATH VIDEO CONTENT */}
            <div className="mt-5 flex justify-between gap-4">
              <div>
                <h4 className="text-coolGray-800 text-2xl dark:text-gray-200 font-bold">
                  {currentLesson?.fields.title}
                </h4>
                <p className="text-md font-bodycopy lg:max-w-xl mb-4 mt-1 text-black/60 dark:text-gray-400">
                  {currentLesson?.fields.description}
                </p>
                <div className="px-0.5">
                  {course.fields.creator &&
                    // @ts-expect-error need to figure out how to better handle CreatorTeam in Typescript
                    (course.fields.creator.fields.members ? (
                      <div className="hidden sm:flex flex-col gap-2 sm:flex-row sm:gap-10">
                        {(course.fields.creator as Entry<ContentfulCreatorTeamFields>).fields.members.map(
                          (member: Entry<ContentfulCreatorFields>) => (
                            <CreatorLockup key={member.sys.id} creator={member} />
                          )
                        )}
                      </div>
                    ) : (
                      <CreatorLockup creator={currentLesson?.fields.video?.fields.creator ?? course.fields.creator} />
                    ))}
                </div>
              </div>
              <div className="flex flex-col lg:flex-row items-start gap-3">
                {/* Mobile Buttons */}
                <Button
                  className="lg:hidden"
                  variant="muted"
                  size="small"
                  icon={
                    currentLesson && localBookmarks.has(currentLesson.sys.id) ? <BookmarkedIcon /> : <BookmarkIcon />
                  }
                  onClick={handleBookmarkClick}
                />
                {user && (
                  <Button
                    className="lg:hidden"
                    variant="muted"
                    size="small"
                    icon={<AnnotationIcon />}
                    onClick={handleGiveFeedbackClick}
                  />
                )}
                {/* Desktop Buttons */}
                {user && (
                  <Button
                    className="hidden lg:inline px-5"
                    variant="muted"
                    size="small"
                    icon={<AnnotationIcon />}
                    onClick={handleGiveFeedbackClick}
                  >
                    <span className="whitespace-nowrap">Give Feedback</span>
                  </Button>
                )}
                <Button
                  className="hidden lg:inline px-5"
                  variant="muted"
                  size="small"
                  icon={
                    currentLesson && localBookmarks.has(currentLesson.sys.id) ? <BookmarkedIcon /> : <BookmarkIcon />
                  }
                  onClick={handleBookmarkClick}
                >
                  <span>{currentLesson && localBookmarks.has(currentLesson.sys.id) ? 'Bookmarked' : 'Bookmark'}</span>
                </Button>
              </div>
            </div>
          </div>

          {(course.fields.products?.length ?? 0) > 0 && (
            <div className="col-span-full hidden sm:block mt-8">
              <Text As="h5" variant="headline6" className="mb-5 text-gray-800">
                Gear Guide
              </Text>
              <ProductGuide course={course} />
            </div>
          )}
          {course.sys.id === courseNamesMap['Zion National Park'] && (
            <div className="mx-[10%] mt-6 col-span-full">
              <ZionAdgCalloutSection location="player" />
            </div>
          )}
        </main>
      )}
      <Modal onClose={() => setShowFeedbackModal(false)} open={showFeedbackModal}>
        <form className="p-8 max-w-2xl" onSubmit={handleFeedbackSubmit}>
          <h1 className="text-2xl font-bold">Give feedback about {course.fields.title}</h1>
          <p className="font-bodycopy mb-6">
            We&apos;re always looking for ways to improve our courses and we&apos;d love to hear from you!
          </p>
          <TextArea
            className="text-left font-bodycopy text-md"
            id="feedback"
            label=""
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          <div className="flex gap-2 justify-end mt-1">
            <Button
              disabled={feedbackStatusText !== ''}
              type="button"
              variant="muted"
              onClick={() => setShowFeedbackModal(false)}
            >
              Cancel
            </Button>
            <Button disabled={feedbackStatusText !== ''} type="submit" variant="secondary">
              {feedbackStatusText === '' ? 'Send Feedback' : feedbackStatusText}
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
