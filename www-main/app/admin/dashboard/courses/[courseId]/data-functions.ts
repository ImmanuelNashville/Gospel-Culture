import humanizeDuration from 'humanize-duration';
import contentfulClient from 'contentful/contentfulClient';
import { ContentfulCourseFields } from 'models/contentful';
import { getMuxViews, MuxMetricsOverallResponse } from '../../utils/mux';
import { getProgressItemsForCourse } from '../../utils/fauna';
import type { Breakdown } from './components/CompletionBreakdown';
import 'server-only';

export async function getFullCourse(courseId: string) {
  const response = await contentfulClient.getEntries<ContentfulCourseFields>({
    'sys.id': courseId,
    include: 10,
  });
  return response.items[0];
}

export async function getViewsForCourseId(courseId: string) {
  try {
    const muxData = (await getMuxViews('overall', 'course', courseId, '30:days')) as MuxMetricsOverallResponse;
    return new Intl.NumberFormat().format(muxData.data.total_views);
  } catch (e) {
    console.error(e);
    return '⛔️';
  }
}

export async function getWatchTimeForCourseId(courseId: string) {
  try {
    const muxData = (await getMuxViews('overall', 'course', courseId, '30:days')) as MuxMetricsOverallResponse;
    return humanizeDuration(Math.round(muxData.data.total_watch_time / (1000 * 60)) * (1000 * 60));
  } catch (e) {
    console.error(e);
    return '⛔️';
  }
}

export async function getLessonCompletionBreakdown(courseId: string) {
  const course = await getFullCourse(courseId);
  const progressItems = await getProgressItemsForCourse(courseId);

  const lessonCompletionMap: Record<string, number> = {};
  const videoStartMap: Record<string, number> = {};
  for (const item of progressItems) {
    for (const lessonId of item.data.completedLessons) {
      if (!lessonCompletionMap[lessonId]) {
        lessonCompletionMap[lessonId] = 1;
      } else {
        lessonCompletionMap[lessonId] += 1;
      }
    }
    for (const muxVideoId of Object.keys(item.data.videoProgress)) {
      if (!videoStartMap[muxVideoId]) {
        videoStartMap[muxVideoId] = 1;
      } else {
        videoStartMap[muxVideoId] += 1;
      }
    }
  }

  const chapters = course.fields.chapters ?? [];
  const orderedLessons = chapters.flatMap((chapter) =>
    chapter.fields.lessons!.map((lesson) => ({
      id: lesson.sys.id,
      title: lesson.fields.title,
      videoId: lesson.fields.video!.sys.id,
    }))
  );

  const lessonBreakdown: Breakdown[] = orderedLessons.map(({ title, id, videoId }) => {
    const start = videoStartMap[videoId] ?? 0;
    const finish = lessonCompletionMap[id] ?? 0;

    return {
      id,
      title,
      started: {
        rawNumber: start,
        percentage: (start / progressItems.length) * 100,
      },
      finished: {
        rawNumber: finish,
        percentage: (finish / progressItems.length) * 100,
      },
    };
  });

  return lessonBreakdown;
}

export async function getChapterCompletionBreakdown(courseId: string) {
  const course = await getFullCourse(courseId);
  const progressItems = await getProgressItemsForCourse(courseId);
  const chapters = course.fields.chapters ?? [];

  const orderedChaptersWithLessons = chapters.map((chapter) => ({
    chapterId: chapter.sys.id,
    lessonIdsInChapter: chapter.fields.lessons!.map((lesson) => lesson.sys.id),
    videoIdsInChapter: chapter.fields.lessons!.map((lesson) => lesson.fields.video!.sys.id),
  }));

  const chapterCompletionMap: Record<string, number> = {};
  const chapterStartMap: Record<string, number> = {};

  for (const item of progressItems) {
    for (const chapter of orderedChaptersWithLessons) {
      if (chapter.lessonIdsInChapter.every((lessonId) => item.data.completedLessons.includes(lessonId))) {
        if (chapterCompletionMap[chapter.chapterId]) {
          chapterCompletionMap[chapter.chapterId] += 1;
        } else {
          chapterCompletionMap[chapter.chapterId] = 1;
        }
      }
      if (chapter.videoIdsInChapter.some((videoId) => Object.keys(item.data.videoProgress).includes(videoId))) {
        if (chapterStartMap[chapter.chapterId]) {
          chapterStartMap[chapter.chapterId] += 1;
        } else {
          chapterStartMap[chapter.chapterId] = 1;
        }
      }
    }
  }

  const chapterBreakdown: Breakdown[] = orderedChaptersWithLessons.map(({ chapterId }) => {
    const start = chapterStartMap[chapterId] ?? 0;
    const finish = chapterCompletionMap[chapterId] ?? 0;

    return {
      title: course.fields.chapters!.find((chapter) => chapter.sys.id === chapterId)?.fields.title ?? 'Unknown Chapter',
      id: chapterId,
      started: {
        rawNumber: start,
        percentage: (start / progressItems.length) * 100,
      },
      finished: {
        rawNumber: finish,
        percentage: (finish / progressItems.length) * 100,
      },
    };
  });

  return chapterBreakdown;
}
