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
  const allSingleVideoPagesResponse = await contentfulClient.getEntries<{ slug: string }>({
    select: 'fields.slug',
    content_type: 'singleVideoPage',
  });

  return {
    paths: [...allSingleVideoPagesResponse.items.map((item) => `/videos/${item.fields.slug}`)],
    fallback: true,
  };
}

export async function getStaticProps(context: GetStaticPropsContext<{ videoSlug: string }>) {
  const { params: { videoSlug } = {} } = context;

  if (!videoSlug)
    return {
      notFound: true,
      props: {},
    };

  const singleVideoPageResponse = await contentfulClient.getEntries<ContentfulSingleVideoPageFields>({
    content_type: 'singleVideoPage',
    'fields.slug': videoSlug,
    include: 10,
  });
  const singleVideoPage = singleVideoPageResponse.items[0];

  if (!singleVideoPage) return { notFound: true, props: {} };

  const tokens = getMuxVideoTokenForSignedPlaybackId(singleVideoPage.fields.video.fields.video?.signedPlaybackId ?? '');

  let relatedItemsTrailerTokens: { id: string; token: MuxToken }[] = [];
  if (singleVideoPage.fields.relatedItems) {
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
        url: `https://www.brighttrip.com${
          singleVideoPage?.fields.title ? `/videos/${singleVideoPage.fields.title}` : ''
        }`,
        description: singleVideoPage?.fields.description ?? '',
        images: [
          {
            url: singleVideoPage?.fields.video.fields.thumbnail
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
      {singleVideoPage?.fields.video && (
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
                  <div className="flex flex-col pb-1">
                    <h2 className="text-white text-headline6 font-bold mt-4">Subscribe to watch this video</h2>
                    <p className="text-white font-bodycopy mt-2 mb-6 opacity-90">
                      Check out this video and thousands more by becoming a Bright Trip subscriber. Get instant access
                      to hundreds of hours of videos to help you travel smarter.
                    </p>
                    <Link href="/subscription?term=annual" className="justify-self-end block">
                      <Button variant="background" className="font-bold px-5">
                        Subscribe
                      </Button>
                    </Link>
                  </div>
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
                  autoPlay={true}
                  poster={singleVideoPage.fields.video.fields.thumbnail?.fields.file.url ?? undefined}
                  ref={videoRef}
                />
              </div>
            )}
          </div>
        </section>
      )}
      <section className="md:max-w-screen-lg lg:max-w-screen-lg 2xl:max-w-screen-xl mx-auto mb-4 flex flex-col p-4 md:p-6 md:py-4 md:grid grid-cols-5 gap-8">
        <div className="col-span-3 space-y-2 px-4 md:px-0">
          <h1 className="text-3xl font-bold dark:text-gray-300">{singleVideoPage?.fields.title}</h1>
          <p className="text-body font-bodycopy leading-relaxed text-gray-700 dark:text-gray-400">
            {singleVideoPage?.fields.description}
          </p>
        </div>
        {(singleVideoPage?.fields.relatedItems?.length ?? 0) > 0 && (
          <aside className="col-span-2 mx-4 md:mx-0 bg-gradient-to-bl from-bt-teal to-bt-teal-light dark:to-bt-teal-light/30 text-white p-4 pb-3 rounded-lg drop-shadow-md">
            <h2 className="text-subtitle1 font-bold uppercase mb-0.5">Dive Deeper</h2>
            <p className="text-bodySmall font-bodycopy mb-3">
              {singleVideoPage?.fields.relatedItemsLabel ?? 'Liked this? Check this out...'}
            </p>
            {singleVideoPage?.fields.relatedItems?.map((item) => {
              const token = relatedItemsTrailerTokens?.find((t) => t.id === item.sys.id)?.token;
              if (token) {
                return <CourseCard key={item.sys.id} course={item as Course} />;
              }
              return null;
            })}
          </aside>
        )}
      </section>
    </Layout>
  );
}
