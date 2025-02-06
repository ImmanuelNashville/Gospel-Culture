import { Course, ContentfulCourseFields, ContentfulCreatorTeamFields, Playlist } from '../models/contentful';
import contentfulClient from '../contentful/contentfulClient';
import videoMeta from '../data/video-meta.json';
import { getAdjustedPrice } from './sales';
import { PromoCode } from '../hooks/usePromoCodeInput';
import { formatDuration } from '.';

export type VideoDurationMap = Record<string, { duration: number }>;

export function getDurationsForVideosFromFile(course?: Course | Playlist) {
  const assetMap: VideoDurationMap = { courseTotal: { duration: 0 } };

  if (!course) return assetMap;

  for (const chapter of course.fields.chapters ?? []) {
    for (const lesson of chapter.fields.lessons ?? []) {
      const assetId = lesson.fields.video?.fields.video?.assetId;
      if (assetId) {
        const duration =
          lesson.fields.video?.fields.video?.duration ?? // use the duration from the mux asset in contentful
          (videoMeta.assets as VideoDurationMap)[assetId]?.duration ?? // else use the static json file synced from mux
          0; // else default to 0
        assetMap[assetId] = { duration };
        assetMap.courseTotal.duration += duration;
      }
    }
  }

  return assetMap;
}

export type CourseDurationsMap = Record<Course['sys']['id'], string>;

export async function getDisplayDurationsForAllCourses() {
  const { items: allCourses } = await contentfulClient.getEntries<ContentfulCourseFields>({
    content_type: 'course',
    include: 10,
  });

  return allCourses.reduce((result, course) => {
    const { courseTotal } = getDurationsForVideosFromFile(course);
    result[course.sys.id] = formatDuration(courseTotal.duration ?? 0, 'humanized');
    return result;
  }, {} as CourseDurationsMap);
}

export async function coursePrice(courseId: string, coursePrice: number, trustClient = true, promoCode?: PromoCode) {
  try {
    const response = await contentfulClient.getEntries<ContentfulCourseFields>({
      content_type: 'course',
      'sys.id': courseId,
      select: ['fields.price'],
    });
    return getAdjustedPrice(response.items[0].fields.price ?? 0, courseId, { promoCode });
  } catch (error) {
    console.error(error);
    // if price check fails, trust the data from the client
    if (trustClient) {
      return coursePrice;
    } else {
      throw error;
    }
  }
}

export async function getAllCoursesByCreator(creatorId: string) {
  const { items: teamsIncludingCreator } = await contentfulClient.getEntries<ContentfulCreatorTeamFields>({
    content_type: 'creatorTeam',
    links_to_entry: creatorId,
  });

  const { items: allCoursesWithCreator } = await contentfulClient.getEntries<ContentfulCourseFields>({
    content_type: 'course',
    'fields.creator.sys.id[in]': [creatorId, ...teamsIncludingCreator.map((team) => team.sys.id)].join(','),
  });

  return allCoursesWithCreator;
}
