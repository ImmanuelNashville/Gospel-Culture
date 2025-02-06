import MuxPlayerElement from '@mux/mux-player';
import { GetStaticPropsContext, InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

import Button from '../../components/Button';
import CourseCard from '../../components/Card/CourseCard';
import Layout, { DEFAULT_OPEN_GRAPH } from '../../components/Layout';
import VideoPlayer from '../../components/VideoPlayer';
import contentfulClient from '../../contentful/contentfulClient';
import { useTimestampParam } from '../../hooks/useTimestampParam';
import { useUserDataContext } from '../../hooks/useUserDataContext';
import * as mpClient from '../../mixpanel/client';
import { ContentfulSingleVideoPageFields, Course } from '../../models/contentful';
import btLogoImage from '../../public/images/logo.png';
import { contentfulImageLoader } from '../../utils/contentfulImageLoader';
import { SYSTEM_ORDER_IDS } from '../../utils/enrollment';
import { getMuxVideoTokenForSignedPlaybackId, MuxToken } from '../../utils/tokens';

export async function getStaticPaths() {
  try {
    const allSingleVideoPagesResponse = await contentfulClient.getEntries<{ slug: string }>({
      select: 'fields.slug',
      content_type: 'singleVideoPage',
    });

    return {
      paths: allSingleVideoPagesResponse.items.map((item) => ({
        params: { videoSlug: item.fields.slug },
      })),
      fallback: 'blocking', // Allows on-demand generation
    };
  } catch (error) {
    console.error('Error fetching video paths:', error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps(context: GetStaticPropsContext<{ videoSlug: string }>) {
  const { params: { videoSlug } = {} } = context;

  if (!videoSlug) return { notFound: true };

  try {
    const singleVideoPageResponse = await contentfulClient.getEntries<ContentfulSingleVideoPageFields>({
      content_type: 'singleVideoPage',
      'fields.slug': videoSlug,
      include: 10,
    });

    const singleVideoPage = singleVideoPageResponse.items[0] ?? null;

    if (!singleVideoPage) return { notFound: true };

    const tokens = getMuxVideoTokenForSignedPlaybackId(
      singleVideoPage?.fields.video?.fields.video?.signedPlaybackId ?? ''
    );

    let relatedItemsTrailerTokens: { id: string; token: MuxToken }[] = [];
    if (singleVideoPage?.fields.relatedItems) {
      relatedItemsTrailerTokens = (singleVideoPage.fields.relatedItems as Course[]).map((item) => ({
        id: item.sys.id,
        token: getMuxVideoTokenForSignedPlaybackId(item.fields.trailer?.fields.video?.signedPlaybackId ?? ''),
      }));
    }

    return {
      props: {
        singleVideoPage,
        tokens,
        relatedItemsTrailerTokens,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching video data:', error);
    return {
      props: {
        singleVideoPage: null,
        tokens: null,
        relatedItemsTrailerTokens: [],
      },
    };
  }
}

export default function SingleVideoPage({
  singleVideoPage,
  tokens,
  relatedItemsTrailerTokens,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [trackedLesson, setTrackedLesson] = useState<boolean>(false);
  const videoStartTime = useTimestampParam();
  const { user } = useUserDataContext();
  const videoRef = useRef<MuxPlayerElement>(null);

  if (!singleVideoPage) {
    return (
      <Layout title="Video Not Found">
        <div className="text-center p-10">
          <h1 className="text-3xl font-bold">Video Not Found</h1>
          <p>Sorry, we couldn’t find the video you’re looking for.</p>
        </div>
      </Layout>
    );
  }

  const mpTrackVideoPlay = () => {
    if (!trackedLesson) {
      try {
        mpClient.track(mpClient.Event.LessonPlay, {
          lessonId: singleVideoPage?.sys.id ?? 'Unknown Single Video ID',
          lessonTitle: singleVideoPage?.fields.title ?? 'Unknown Single Video Title',
          courseId: '',
          courseTitle: '',
          type: SYSTEM_ORDER_IDS.SINGLE_VIDEO_FREE,
        });
      } catch (e) {
        console.error(e);
      }
      setTrackedLesson(true);
    }
  };

  const mpTrackVideoComplete = () => {
    try {
      mpClient.track(mpClient.Event.LessonComplete, {
        lessonId: singleVideoPage?.sys.id ?? 'Unknown Video ID',
        lessonTitle: singleVideoPage?.fields.title ?? 'Unknown Video Title',
        courseId: '',
        courseTitle: '',
        type: SYSTEM_ORDER_IDS.SINGLE_VIDEO_FREE,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const showSubscriptionWall = singleVideoPage?.fields.accessType === 'subscription' && !user?.subscribed;

  return (
    <Layout
      fullBleed
      description={singleVideoPage?.fields.description || ''}
      title={singleVideoPage?.fields.title || ''}
      openGraph={{
        url: `https://www.brighttrip.com/videos/${singleVideoPage?.fields.slug ?? ''}`,
        description: singleVideoPage?.fields.description ?? '',
        images: [
          {
            url: singleVideoPage?.fields.video?.fields.thumbnail
              ? `https:${singleVideoPage.fields.video.fields.thumbnail.fields.file.url}?w=800`
              : DEFAULT_OPEN_GRAPH.images[0].url,
            width: 800,
            height: 450,
            alt: `Bright Trip: ${singleVideoPage?.fields.title}`,
            type: 'image/jpeg',
          },
        ],
        site_name: 'Bright Trip',
      }}
    >
      <section>
        <div className="p-4 md:p-6 md:pb-2 md:max-w-screen-lg lg:max-w-screen-lg 2xl:max-w-screen-xl mx-auto">
          {showSubscriptionWall ? (
            <div className="w-full aspect-w-16 aspect-h-9 bg-black">
              <Image
                src={singleVideoPage.fields.video.fields.thumbnail?.fields.file.url ?? ''}
                className="object-cover"
                alt=""
                fill
                sizes="100vw"
                loader={contentfulImageLoader}
              />
              <div className="bg-black opacity-50" />
              <div className="m-auto h-[60%] bg-gradient-to-br from-bt-teal-dark to-bt-teal-light rounded-xl shadow-md text-center p-12 max-w-md flex flex-col justify-center items-center">
                <Image className="filter invert" src={btLogoImage} alt="Bright Trip Logo" height="60" width="246" />
                <h2 className="text-white text-headline6 font-bold mt-4">Subscribe to watch this video</h2>
                <p className="text-white font-bodycopy mt-2 mb-6 opacity-90">
                  Get instant access to hundreds of hours of videos to help you travel smarter.
                </p>
                <Link href="/subscription?term=annual">
                  <Button variant="background" className="font-bold px-5">
                    Subscribe
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden leading-[0]">
              <VideoPlayer
                muxVideo={singleVideoPage?.fields.video}
                muxToken={tokens}
                onPlay={mpTrackVideoPlay}
                onEnded={mpTrackVideoComplete}
                currentTime={videoStartTime}
                autoPlay
                poster={singleVideoPage.fields.video.fields.thumbnail?.fields.file.url ?? undefined}
                ref={videoRef}
              />
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
