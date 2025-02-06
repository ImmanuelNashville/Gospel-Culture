import { Entry } from 'contentful';
import { ContentfulLessonFields, Course } from '../models/contentful';

export function getLessonCountForCourse(course: Course) {
  const chapters = course?.fields.chapters ?? [];
  const lessons = chapters.flatMap((chapter) => chapter.fields.lessons ?? []);
  return lessons.length;
}

export function getLessonThumbnailURL(lesson: Entry<ContentfulLessonFields>, lessonImageToken: string) {
  const customThumbnailURL = lesson.fields.video?.fields.thumbnail?.fields.file.url;

  if (customThumbnailURL) {
    return customThumbnailURL;
  }

  const id = lesson.fields.video?.fields.video?.signedPlaybackId;

  return `https://image.mux.com/${id}/thumbnail.jpg?token=${lessonImageToken}`;
}
