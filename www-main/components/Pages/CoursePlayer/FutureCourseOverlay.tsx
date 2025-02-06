import { LockClosedIcon } from '@heroicons/react/outline';
import { formatDistanceToNowStrict } from 'date-fns';
import FullPageHero from '../../FullPageHero';
import { Course } from '../../../models/contentful';

export function FutureCourseOverlay({ course }: { course: Course }) {
  return (
    <FullPageHero
      bgImageUrl={course.fields.hero?.fields.file.url}
      mainContent={
        <div className="flex flex-col items-center backdrop-blur-xl backdrop-saturate-150 bg-white/10 rounded-3xl px-2 py-4 sm:p-4 md:p-8 pt-5 text-white/80">
          <LockClosedIcon className="mb-4 h-14 w-14 text-white/80" />
          <h1 className="text-3xl font-bold mb-2 text-white/90">{course.fields.title}</h1>
          {course.fields.launchDate && (
            <p className="text-lg text-white/80 font-bodycopy">
              Launches {formatDistanceToNowStrict(new Date(course.fields.launchDate), { addSuffix: true })}
            </p>
          )}
        </div>
      }
    />
  );
}
