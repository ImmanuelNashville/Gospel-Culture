import { ReactElement } from 'react';
import { Course } from '../../../models/contentful';
import CourseCard from '../../Card/CourseCard';

const CourseThemeGrid = ({
  title,
  courses,
  cardContent,
}: {
  title: ReactElement;
  courses: Course[];
  cardContent?: (course: Course) => React.ReactNode;
}) => {
  if (courses.length === 3) {
    return (
      <div className="mb-12">
        {title}
        <div className="mt-3 gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:grid-rows-1">
          {courses.map((course) => (
            <CourseCard
              key={course.sys.id}
              course={course}
              cardContent={() => cardContent?.(course) ?? <></>}
              imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 400px"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      {title}
      <div className="mt-3 gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2">
        {courses.map((course, index) => (
          <CourseCard
            key={course.sys.id}
            course={course}
            cardContent={() => cardContent?.(course) ?? <></>}
            className={index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
            imageSizes={`(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) ${
              index === 0 ? '50vw' : '25vw'
            }, ${index === 0 ? '620px' : '300px'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseThemeGrid;
