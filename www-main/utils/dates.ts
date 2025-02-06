import { formatDistanceToNow, isFuture } from 'date-fns';
import { Course } from '../models/contentful';

export function isFutureCourse(course: Course) {
  return course?.fields.launchDate ? isFuture(new Date(course.fields.launchDate)) : false;
}

export function showRelativeTime(dateString?: string) {
  if (!dateString || String(new Date(dateString)) === 'Invalid Date') {
    return '';
  }
  return formatDistanceToNow(new Date(dateString));
}
