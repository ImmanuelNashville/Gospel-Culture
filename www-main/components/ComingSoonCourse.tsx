import Link from 'next/link';
import { Course } from '../models/contentful';
import { getBaseName } from '../utils/ui-helpers';
import Button from './Button';
import { CalloutSection } from './CalloutSection';
import CourseCard from './Card/CourseCard';
import LaunchDate from './LaunchDate';

interface ComingSoonCourseProps {
  course: Course;
}

export default function ComingSoonCourse({ course }: ComingSoonCourseProps) {
  return (
    <CalloutSection
      title={course.fields.creator?.fields.name ?? ''}
      subtitle={course.fields.promoText ?? course.fields.title ?? ''}
      body={course.fields.oneLineDescription ?? ''}
      leftContent={<CourseCard course={course} />}
      cta={
        <div className="mt-6 flex flex-col-reverse gap-4 md:flex-row md:items-center">
          <Link href={`/${getBaseName(course.sys.id)}/${course.fields.slug}`} className="w-full sm:w-auto">
            <Button className="w-full whitespace-nowrap">Learn More</Button>
          </Link>
          <LaunchDate course={course} />
        </div>
      }
    />
  );
}
