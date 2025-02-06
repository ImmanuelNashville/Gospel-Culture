import { formatDistanceToNowStrict } from 'date-fns';
import { Course } from '../models/contentful';
import { isFutureCourse } from '../utils/dates';

export default function LaunchDate({
  course,
  className = 'font-bodycopy text-white/80 text-sm sm:text-md mb-1 sm:mb-3 bg-bt-teal/80 px-4 py-1 rounded-full max-w-max mx-auto',
}: {
  course: Course;
  className?: string;
}) {
  return isFutureCourse(course) && course.fields.launchDate ? (
    <p className={className}>
      Available {formatDistanceToNowStrict(new Date(course.fields.launchDate), { addSuffix: true })}
    </p>
  ) : null;
}
