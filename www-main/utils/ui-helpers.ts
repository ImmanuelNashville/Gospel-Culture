import { Course } from '../models/contentful';
import appConfig from '../appConfig';

export function createCourseThumbnailURL(course: Course) {
  if (course.fields.tileThumbnail) {
    return course.fields.tileThumbnail.fields.file.url;
  }

  if (course.fields.hero) {
    return course.fields.hero.fields.file.url;
  }

  return '';
}

export const createCourseURL = (course: Course, userCourses?: string[]) => {
  if (userCourses?.includes(course.sys.id) || course.fields.price === 0) {
    return `/my-courses/${course.fields.slug}`;
  }

  return `/${getBaseName(course.sys.id)}/${course.fields.slug}`;
};

export const getBaseName = (courseId?: string) => {
  return appConfig.travelGuides.includes(courseId ?? '') ? 'guides' : 'courses';
};
