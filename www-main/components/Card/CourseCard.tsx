import Link from 'next/link';
import { Course } from '../../models/contentful';
import { createCourseThumbnailURL, createCourseURL } from '../../utils/ui-helpers';
import Card from '../Card';
import React from 'react';
import { useUserDataContext } from '../../hooks/useUserDataContext';

interface CourseCardProps {
  course: Course;
  cardContent?: (course: Course) => React.ReactNode;
  className?: string;
  imageSizes?: string;
  priorityLoading?: boolean;
}

const CourseCard = ({ course, cardContent, imageSizes, className = '', priorityLoading }: CourseCardProps) => {
  const { coursesProgress, enrolledCourses } = useUserDataContext();
  const href = createCourseURL(
    course,
    enrolledCourses.map((c) => c.sys.id)
  );
  const progressData = coursesProgress?.progressPercentages[course.sys.id];

  return (
    <div className={`${className} w-full`}>
      <Link href={href}>
        <Card
          imageUrl={`${createCourseThumbnailURL(course)}`}
          className={className}
          imageSizes={imageSizes}
          priorityLoading={priorityLoading}
        >
          {typeof progressData === 'number' ? (
            <div
              className="absolute bottom-0 left-0 right-0 w-full overflow-hidden rounded-md"
              style={{ height: '6px' }}
            >
              <div
                className="absolute z-10 h-full rounded-md bg-bt-orange"
                style={{ width: `${Math.max(5, progressData)}%` }} // want to display at least some progress if they've started any video in the course
              />
              <div className="absolute h-full w-full bg-gray-800 opacity-10" />
            </div>
          ) : (
            <></>
          )}
          {cardContent?.(course) ?? <></>}
        </Card>
      </Link>
    </div>
  );
};

export default CourseCard;
