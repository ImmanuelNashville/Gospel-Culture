import { getSession } from '@auth0/nextjs-auth0';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/outline';
import { Entry } from 'contentful';
import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Cookies, useCookies } from 'react-cookie';
import appConfig from '../../appConfig';
import Button from '../../components/Button';
import Layout from '../../components/Layout';
import { EndScreenCompleted } from '../../components/Pages/CoursePlayer/EndScreenCompleted';
import { EndScreenWithNextVideo } from '../../components/Pages/CoursePlayer/EndScreenWithNextVideo';
import LessonButton from '../../components/Pages/CoursePlayer/LessonButton';
import ShareCourseButton from '../../components/ShareCourseButton';
import VideoPlayer from '../../components/VideoPlayer';
import contentfulClient from '../../contentful/contentfulClient';
import { getUserByEmail, getUserProgressForCourse } from '../../fauna/functions';
import { useCountdown } from '../../hooks/useCountdown';
import { useUserDataContext } from '../../hooks/useUserDataContext';
import * as mpClient from '../../mixpanel/client';
import {
  ContentfulChapterFields,
  ContentfulCourseFields,
  ContentfulPlaylistFields,
  Course,
} from '../../models/contentful';
import { FaunaUserData } from '../../models/fauna';
import { formatDuration } from '../../utils';
import { contentfulImageLoader } from '../../utils/contentfulImageLoader';
import { getLessonThumbnailURL } from '../../utils/courses';
import { getDurationsForVideosFromFile, VideoDurationMap } from '../../utils/courses.server';
import { SYSTEM_ORDER_IDS } from '../../utils/enrollment';
import { getMuxTokensForCoursePlayer } from '../../utils/tokens';
import { createCourseURL } from '../../utils/ui-helpers';

const getCompletedCookieName = (playlistId: string) => `bt-pl-${playlistId}-completed`;
const getProgressCookieName = (playlistId: string) => `bt-pl-${playlistId}-progress`;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context.req, context.res);
  const { params: { playlistSlug } = {} } = context;

  const redirect = {
    redirect: {
      destination: `/`,
      permanent: false,
    },
  };

  if (!playlistSlug) {
    return redirect;
  }

  const playlistResponse = await contentfulClient.getEntries<ContentfulPlaylistFields>({
    'fields.slug': String(playlistSlug),
    content_type: 'playlist',
    include: 10,
  });

  if (playlistResponse.items.length === 0) {
    return redirect;
  }

  const playlist = playlistResponse.items[0];
  const videoAssets = getDurationsForVideosFromFile(playlist);
  const playlistLessonIds =
    (playlist.fields.chapters
      ?.flatMap((chapter) => chapter.fields.lessons?.map((lesson) => lesson.sys.id))
      .filter(Boolean) as string[]) ?? [];
  const courseIdsByPlaylistVideo = await playlistLessonIds.reduce(async (mapping, lessonId) => {
    const resolvedMap = await mapping;
    try {
      const { items: matchingChapters } = await contentfulClient.getEntries<ContentfulChapterFields>({
        content_type: 'courseChapter',
        links_to_entry: lessonId,
      });
      const matchingParents = await Promise.allSettled(
        matchingChapters.map(async (chapter) => {
          const { items: matchingCourses } = await contentfulClient.getEntries<ContentfulCourseFields>({
            content_type: 'course',
            links_to_entry: chapter.sys.id,
          });
          return matchingCourses[0];
        })
      );
      const [matchingCourse] = matchingParents
        .map((settled) => (settled.status === 'fulfilled' ? (settled.value as Course) : null))
        .filter(Boolean) as Course[];
      resolvedMap[lessonId] = matchingCourse ?? null;
    } catch (error) {
      console.error(error);
    }
    return resolvedMap;
  }, {} as Promise<Record<string, Course>>);

  let completedLessons: string[];
  let videoProgress: Record<string, number>;

  if (!session?.user.email) {
    const cookies = new Cookies(context.req.cookies);
    completedLessons = cookies.get(getCompletedCookieName(playlist.sys.id)) ?? [];
    videoProgress = cookies.get(getProgressCookieName(playlist.sys.id)) ?? {};
  } else {
    const progressData = await getUserProgressForCourse(playlist.sys.id, session.user.email);
    completedLessons = progressData.completedLessons;
    videoProgress = progressData.videoProgress;
  }

  let user = null;
  if (session?.user.email) {
    user = await getUserByEmail(session.user.email);
  }

  return {
    props: {
      playlist,
      tokens: getMuxTokensForCoursePlayer(playlist),
      videoAssets,
      user,
      completedLessons,
      videoProgress,
      courseIdsByPlaylistVideo,
    },
  };
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
  playlist: Entry<ContentfulPlaylistFields>;
  tokens: ReturnType<typeof getMuxTokensForCoursePlayer>;
  videoAssets: VideoDurationMap;
  completedLessons: string[];
  videoProgress: Record<string, number>;
  user: FaunaUserData | null;
  courseIdsByPlaylistVideo: Record<string, Course | null>;
}

export default function CoursePlayerPage({
  playlist,
  tokens,
  videoAssets,
  completedLessons,
  videoProgress,
  user,
  courseIdsByPlaylistVideo,
}: CoursePlayerPageProps) {
  const router = useRouter();
  const { enrolledCourses } = useUserDataContext();
  const [localCompletedLessons, setLocalCompletedLessons] = useState<Set<string>>(new Set(completedLessons));
  const lessons = useMemo(
    () => playlist.fields.chapters?.flatMap((chapter) => chapter.fields.lessons) ?? [],
    [playlist.fields.chapters]
  );
  const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
    if (router.query.v) {
      return lessons.findIndex((lesson) => lesson?.sys.id === String(router.query.v));
    }
    if (Array.from(localCompletedLessons).length > 0) {
      for (let i = 0; i < lessons.length; i += 1) {
        if (!Array.from(localCompletedLessons).includes(lessons?.[i]?.sys.id ?? '')) {
          return i;
        }
      }
    }
    return 0;
  });
  const [localVideoProgress, setLocalVideoProgress] = useState(videoProgress);

  const currentLesson = lessons[currentLessonIndex];
  const nextLesson = currentLessonIndex + 1 < lessons.length ? lessons[currentLessonIndex + 1] : null;
  const nextLessonImageUrl = nextLesson
    ? getLessonThumbnailURL(nextLesson, tokens.image[nextLesson.fields.video?.fields.video?.signedPlaybackId ?? ''])
    : null;
  const isLastLesson = currentLessonIndex === lessons.length - 1;

  const [, setCookie] = useCookies();

  const { isRunning, start, reset, timeRemaining } = useCountdown(5, () => {
    if (isLastLesson) return;

    if (currentLessonIndex < lessons.length) {
      if (currentLesson?.sys.id) {
        const newCompletedLessons = localCompletedLessons;
        newCompletedLessons?.add(currentLesson.sys.id);
        setLocalCompletedLessons(newCompletedLessons);
        syncCompletedLessons(playlist.sys.id, newCompletedLessons, user, setCookie);
      }

      if (!isLastLesson) {
        setCurrentLessonIndex(currentLessonIndex + 1);
      }
    }
    reset();
  });

  useEffect(() => {
    if (currentLesson?.sys.id) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('v', currentLesson.sys.id);
      router.replace(newUrl, undefined, { shallow: true });
    }
    // TODO: figure out how to make `router` not re-run this effect everytime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson?.sys.id]);

  const handleClickLesson = (id: string) => {
    if (isRunning) {
      reset();
    }
    const indexToSet = lessons.findIndex((lesson) => lesson?.sys.id === id);
    setCurrentLessonIndex(indexToSet);
  };

  const handleTrackVideoProgress = (secondsElapsed: number, videoId: string) => {
    const updatedVideoProgress = {
      ...localVideoProgress,
      [videoId]: secondsElapsed,
    };
    setLocalVideoProgress(updatedVideoProgress);
    syncVideoProgress(playlist.sys.id, updatedVideoProgress, user, setCookie);
  };

  const [trackedLesson, setTrackedLesson] = useState<number | null>(null);
  const mpTrackLessonPlay = () => {
    if (currentLessonIndex !== trackedLesson) {
      try {
        mpClient.track(mpClient.Event.PlaylistVideoPlay, {
          lessonId: currentLesson?.sys.id ?? 'Unknown Lesson ID',
          lessonTitle: currentLesson?.fields.title ?? 'Unknown Lesson Title',
          courseId: playlist.sys.id,
          courseTitle: playlist.fields.title,
          type: SYSTEM_ORDER_IDS.PLAYLIST,
        });
        mpClient.track(mpClient.Event.LessonPlay, {
          lessonId: currentLesson?.sys.id ?? 'Unknown Lesson ID',
          lessonTitle: currentLesson?.fields.title ?? 'Unknown Lesson Title',
          courseId: courseContainingCurrentLesson?.sys.id ?? playlist.sys.id,
          courseTitle: courseContainingCurrentLesson?.fields.title ?? playlist.fields.title,
          type: SYSTEM_ORDER_IDS.PLAYLIST,
        });
      } catch (e) {
        console.error(e);
      }
      setTrackedLesson(currentLessonIndex);
    }
  };

  const mpTrackLessonComplete = () => {
    try {
      mpClient.track(mpClient.Event.PlaylistVideoComplete, {
        lessonId: currentLesson?.sys.id ?? 'Unknown Lesson ID',
        lessonTitle: currentLesson?.fields.title ?? 'Unknown Lesson Title',
        courseId: playlist.sys.id,
        courseTitle: playlist.fields.title,
        type: SYSTEM_ORDER_IDS.PLAYLIST,
      });
      mpClient.track(mpClient.Event.LessonComplete, {
        lessonId: currentLesson?.sys.id ?? 'Unknown Lesson ID',
        lessonTitle: currentLesson?.fields.title ?? 'Unknown Lesson Title',
        courseId: playlist.sys.id,
        courseTitle: playlist.fields.title,
        type: SYSTEM_ORDER_IDS.PLAYLIST,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const courseContainingCurrentLesson = courseIdsByPlaylistVideo[currentLesson?.sys.id ?? ''] ?? null;

  return (
    <Layout
      title={playlist.fields.title}
      description={`Bright Trip's "${playlist.fields.title}" video playlist`}
      fullBleed
    >
      <main className="mx-auto max-w-screen-2xl items-start gap-5 p-6 lg:grid lg:grid-cols-12">
        <div className="z-10 col-span-9 -mx-1 pt-3 pb-3 lg:top-32 lg:mx-0 lg:pt-0 lg:pb-0">
          <div className="relative w-full overflow-hidden rounded-lg drop-shadow-lg filter leading-[0]">
            {currentLesson && currentLesson.fields.video && (
              <VideoPlayer
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
                  videoSeries: playlist.sys.id,
                }}
              />
            )}
            {isRunning && (
              <div className="absolute bottom-0 right-1/4 top-0 left-1/4 flex flex-col items-center justify-center gap-2">
                {isLastLesson ? (
                  <EndScreenCompleted
                    itemTitle={playlist.fields.title}
                    ctaText="Check out the rest of our catalog to find something to watch next."
                    ctaButtonText="Find Your Next Course"
                    ctaHref="/"
                  />
                ) : (
                  <EndScreenWithNextVideo
                    text={`"${nextLesson?.fields.title}" will start in ${timeRemaining} seconds`}
                    imageUrl={nextLessonImageUrl}
                    onCancelClick={() => {
                      if (currentLesson?.sys.id) {
                        const newCompletedLessons = localCompletedLessons;
                        newCompletedLessons?.add(currentLesson.sys.id);
                        setLocalCompletedLessons(newCompletedLessons);
                        syncCompletedLessons(playlist.sys.id, newCompletedLessons, user, setCookie);
                      }
                      reset();
                    }}
                    onConfirmClick={() => {
                      if (currentLesson?.sys.id) {
                        const newCompletedLessons = localCompletedLessons;
                        newCompletedLessons?.add(currentLesson.sys.id);
                        setLocalCompletedLessons(newCompletedLessons);
                        syncCompletedLessons(playlist.sys.id, newCompletedLessons, user, setCookie);
                      }
                      if (nextLesson) {
                        handleClickLesson(nextLesson.sys.id);
                      }
                      reset();
                    }}
                  />
                )}
              </div>
            )}
          </div>
          <div className="mt-5 flex justify-between gap-4 border-b pb-5 mb-3 md:border-none md:pb-0 md:mb-0">
            <div>
              <h4 className="text-black/80 dark:text-white/80 text-xl md:text-2xl font-bold">
                {currentLesson?.fields.title}
              </h4>
              <p className="mt-2 font-bodycopy mb-2 text-black/60 dark:text-white/60 max-w-2xl text-bodySmall md:text-body">
                {currentLesson?.fields.description}
              </p>
              {courseContainingCurrentLesson && (
                <div className="flex flex-col gap-2">
                  <p className="text-bodySmall md:text-body text-black/60 dark:text-white/60 font-bodycopy">
                    To learn more, check out our{' '}
                    <span className="font-bold">{courseContainingCurrentLesson.fields.title}</span>{' '}
                    {appConfig.travelGuides.includes(courseContainingCurrentLesson.sys.id) ? 'guide' : 'course'}.
                  </p>
                  <Link
                    href={createCourseURL(
                      courseContainingCurrentLesson,
                      enrolledCourses.map((c) => c.id)
                    )}
                    className="md:hidden"
                  >
                    <Button variant="secondary" className="whitespace-nowrap mt-2 md:mt-0">
                      Explore the Full{' '}
                      {appConfig.travelGuides.includes(courseContainingCurrentLesson.sys.id) ? 'Guide' : 'Course'}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            {currentLesson && (
              <div className="flex items-start gap-2">
                <ShareCourseButton />
                {courseContainingCurrentLesson && (
                  <Link
                    href={createCourseURL(
                      courseContainingCurrentLesson,
                      enrolledCourses.map((c) => c.id)
                    )}
                    className="hidden md:inline"
                  >
                    <Button variant="secondary" className="whitespace-nowrap px-5">
                      Explore the Full{' '}
                      {appConfig.travelGuides.includes(courseContainingCurrentLesson.sys.id) ? 'Guide' : 'Course'}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden rounded-lg bg-bt-background-light dark:bg-gray-800 shadow-md">
          <div className="flex items-center gap-4 pt-4 px-4">
            <Image
              className="rounded-md w-16 h-16"
              src={playlist.fields.tileThumbnail?.fields.file.url ?? ''}
              alt={playlist.fields.title}
              width="64"
              height="64"
              loader={contentfulImageLoader}
            />
            <div>
              <h2 className="text-subtitle1 text-gray-900 dark:text-gray-200 font-bold">{playlist.fields.title}</h2>
              <div className="flex gap-2 items-center">
                <span className="text-bodySmall text-gray-600 dark:text-gray-400">{lessons.length ?? 0} videos</span>
                {Boolean(videoAssets.courseTotal?.duration) && (
                  <>
                    <span className="text-bt-teal dark:text-bt-teal-light">•</span>
                    <span className="text-bodySmall text-gray-600 dark:text-gray-400">
                      {formatDuration(Number(videoAssets.courseTotal?.duration), 'mm minutes')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '680px' }}>
            <div className="divide-y divide-bt-teal-ultraLight/20 border-t border-bt-teal-ultraLight/20">
              {playlist.fields.chapters?.map((chapter) => (
                <Disclosure key={chapter.sys.id} defaultOpen>
                  {({ open }) => (
                    <div className="relative flex flex-col gap-3 py-4">
                      <Disclosure.Button className="flex items-center justify-between px-4">
                        <h3 className="text-body font-bold text-left text-gray-800 dark:text-gray-300">
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
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
