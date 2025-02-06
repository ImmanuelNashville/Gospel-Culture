import { JWT } from '@mux/mux-node';
import { createClient, Entry } from 'contentful';
import { ThumbnailOptions } from '../components/VideoThumbnail';
import contentfulClient from '../contentful/contentfulClient';
import { ContentfulCourseFields, ContentfulLessonFields, Course, Playlist } from '../models/contentful';

const getMuxSecret = () => {
  const muxFromEnv = process.env.MUX_SIGNING_KEY_SECRET;
  if (muxFromEnv && !muxFromEnv.includes('BEGIN')) {
    // need to decode it
    return Buffer.from(muxFromEnv, 'base64').toString();
  }
  return muxFromEnv;
};

const optionDefaults = {
  keyId: process.env.MUX_KEY_ID,
  keySecret: getMuxSecret(),
  expiration: '30d',
};

export function getMuxVideoTokenForSignedPlaybackId(id: string, options?: ThumbnailOptions) {
  const videoOptions = {
    ...optionDefaults,
    type: 'video',
  } as const;

  const imageOptions = {
    ...optionDefaults,
    type: 'thumbnail',
  } as const;

  const storyboardOptions = {
    ...optionDefaults,
    type: 'storyboard',
  } as const;

  return {
    video: JWT.sign(id, videoOptions),
    thumbnail: JWT.sign(id, { ...imageOptions, ...(options && { params: options }) }),
    storyboard: JWT.sign(id, storyboardOptions),
  };
}

// This can only be successfully used in a server-side call like `getServerSideProps` or `getStaticProps`
export function getMuxTokensForCourseMarketing(course?: Course) {
  if (!course)
    return {
      video: {},
      image: {},
      sample: {},
      storyboard: {},
    };

  const videoIdsToSign = new Set([
    course.fields.trailer?.fields.video?.signedPlaybackId,
    course.fields.heroVideo?.fields.video?.signedPlaybackId,
  ]);
  const imageIdsToSign = new Set([
    course.fields.trailer?.fields.video?.signedPlaybackId,
    course.fields.heroVideo?.fields.video?.signedPlaybackId,
  ]);
  const sampleImageIdsToSign = new Set<string>();

  const videoTokens: Record<string, string> = {};
  const imageTokens: Record<string, string> = {};
  const sampleTokens: Record<string, { portrait: string; landscape: string }> = {};
  const storyboardTokens: Record<string, string> = {};
  const imageThumbnailParams: Record<string, ThumbnailOptions> = {};

  course.fields.samples?.forEach((sample) => {
    videoIdsToSign.add(sample.fields.video?.signedPlaybackId);
    sampleImageIdsToSign.add(sample.fields.video?.signedPlaybackId ?? '');

    imageThumbnailParams[`${sample.fields.video?.signedPlaybackId}-portrait`] = {
      time: sample.fields.thumbnailTimecode,
      height: 720,
      width: Math.floor(720 / (16 / 9)),
      fit_mode: 'crop',
    };

    imageThumbnailParams[`${sample.fields.video?.signedPlaybackId}-landscape`] = {
      time: sample.fields.thumbnailTimecode,
    };
  });
  course.fields.chapters?.forEach((chapter) =>
    chapter.fields.lessons?.forEach((lesson) => {
      const lessonVideo = lesson.fields.video;
      const id = lessonVideo?.fields.video?.signedPlaybackId;
      if (id) {
        imageIdsToSign.add(id);
        imageThumbnailParams[id] = { time: lessonVideo.fields.thumbnailTimecode, width: 500 };
      }
    })
  );

  const videoOptions = {
    ...optionDefaults,
    type: 'video',
  } as const;

  const storyboardOptions = {
    ...optionDefaults,
    type: 'storyboard',
  } as const;

  videoIdsToSign.forEach((videoId) => {
    if (videoId) {
      videoTokens[videoId] = JWT.sign(videoId, videoOptions);
      storyboardTokens[videoId] = JWT.sign(videoId, storyboardOptions);
    }
  });

  const imageOptions = {
    ...optionDefaults,
    type: 'thumbnail',
  } as const;

  imageIdsToSign.forEach((imageId) => {
    if (imageId) {
      const options = imageThumbnailParams[imageId]
        ? { ...imageOptions, params: imageThumbnailParams[imageId] }
        : imageOptions;
      imageTokens[imageId] = JWT.sign(imageId, options);
    }
  });

  sampleImageIdsToSign.forEach((imageId) => {
    if (imageId) {
      const portraitOptions = imageThumbnailParams[`${imageId}-portrait`]
        ? { ...imageOptions, params: imageThumbnailParams[`${imageId}-portrait`] }
        : imageOptions;
      const landscapeOptions = imageThumbnailParams[`${imageId}-landscape`]
        ? { ...imageOptions, params: imageThumbnailParams[`${imageId}-landscape`] }
        : imageOptions;

      sampleTokens[imageId] = {
        portrait: JWT.sign(imageId, portraitOptions),
        landscape: JWT.sign(imageId, landscapeOptions),
      };
    }
  });

  return {
    video: videoTokens,
    image: imageTokens,
    sample: sampleTokens,
    storyboard: storyboardTokens,
  };
}

// This can only be successfully used in a server-side call like `getServerSideProps` or `getStaticProps`
export function getMuxTokensForCoursePlayer(course: Course | Playlist) {
  const playbackIdsToSign =
    course.fields.chapters
      ?.flatMap((chapter) =>
        chapter.fields.lessons?.map((lesson) => ({
          id: lesson.fields.video?.fields.video?.signedPlaybackId,
          thumbnailTimecode: lesson.fields.video?.fields.thumbnailTimecode,
        }))
      )
      .filter(Boolean) ?? [];

  const videoTokens: Record<string, string> = {};
  const imageTokens: Record<string, string> = {};
  const storyboardTokens: Record<string, string> = {};

  const videoOptions = {
    ...optionDefaults,
    expiration: '1d',
    type: 'video',
  } as const;

  const storyboardOptions = {
    ...optionDefaults,
    type: 'storyboard',
  } as const;

  const imageOptions = {
    ...optionDefaults,
    type: 'thumbnail',
  } as const;

  playbackIdsToSign?.forEach((item) => {
    if (item?.id) {
      videoTokens[item.id] = JWT.sign(item.id, videoOptions);
      storyboardTokens[item.id] = JWT.sign(item.id, storyboardOptions);
      imageTokens[item.id] = JWT.sign(item.id, {
        ...imageOptions,
        params: { width: 620, time: item.thumbnailTimecode },
      });
    }
  });

  return {
    video: videoTokens,
    image: imageTokens,
    storyboard: storyboardTokens,
  };
}

// This can only be successfully used in a server-side call like `getServerSideProps` or `getStaticProps`
export function getTokensForTopLessons(lessons: (Entry<ContentfulLessonFields> | undefined)[]) {
  if (!lessons?.length) return {};

  const playbackIdsToSign =
    lessons
      .map((lesson) => ({
        id: lesson?.fields.video?.fields.video?.signedPlaybackId,
        thumbnailTimecode: lesson?.fields.video?.fields.thumbnailTimecode ?? 0,
      }))
      .filter(Boolean) ?? [];
  const imageTokens: Record<string, string> = {};

  const imageOptions = {
    ...optionDefaults,
    type: 'thumbnail',
  } as const;

  playbackIdsToSign?.forEach((item) => {
    if (item?.id) {
      imageTokens[item.id] = JWT.sign(item.id, {
        ...imageOptions,
        params: { width: 620, time: item.thumbnailTimecode },
      });
    }
  });

  return imageTokens;
}

export type MuxToken = {
  video: ReturnType<typeof JWT.sign>;
  thumbnail: ReturnType<typeof JWT.sign>;
  storyboard: ReturnType<typeof JWT.sign>;
};

export type TrailerTokenMap = Record<Course['sys']['id'], MuxToken>;

// This can only be successfully used in a server-side call like `getServerSideProps` or `getStaticProps`
export async function getTokensForAllTrailers(preview = false): Promise<TrailerTokenMap> {
  let courses = [];

  if (preview) {
    const contentfulPreviewClient = createClient({
      accessToken: process.env.CONTENTFUL_CONTENT_PREVIEW_API_ACCESS_TOKEN ?? '',
      space: process.env.CONTENTFUL_SPACE_ID ?? '',
      host: 'preview.contentful.com',
    });
    const { items } = await contentfulPreviewClient.getEntries<{ trailer: ContentfulCourseFields['trailer'] }>({
      content_type: 'course',
      select: 'fields.trailer',
      include: 10,
    });
    courses = items;
  } else {
    const { items } = await contentfulClient.getEntries<{ trailer: ContentfulCourseFields['trailer'] }>({
      content_type: 'course',
      select: 'fields.trailer',
      include: 10,
    });
    courses = items;
  }

  if (!courses || courses.length < 1) {
    throw new Error('failed to fetch courses from contentful');
  }

  return courses.reduce((result, course) => {
    const { signedPlaybackId } = course.fields?.trailer?.fields.video ?? {};
    if (signedPlaybackId) {
      result[course.sys.id] = {
        video: JWT.sign(signedPlaybackId, {
          ...optionDefaults,
          type: 'video',
        }),
        thumbnail: JWT.sign(signedPlaybackId, {
          ...optionDefaults,
          type: 'thumbnail',
        }),
        storyboard: JWT.sign(signedPlaybackId, {
          ...optionDefaults,
          type: 'storyboard',
        }),
      };
    }
    return result;
  }, {} as TrailerTokenMap);
}
