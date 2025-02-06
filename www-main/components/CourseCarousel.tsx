import { Course } from '../models/contentful';
import { CourseDurationsMap } from '../utils/courses.server';
import { TrailerTokenMap } from '../utils/tokens';
import CourseCard from './Card/CourseCard';
import CardCarousel from './CardCarousel';

export interface CourseCarouselData {
  title: string;
  description: string;
  courses: Course[];
  progressData?: Record<Course['sys']['id'], number>;
}

interface CourseCarouselProps {
  data: CourseCarouselData;
  trailerTokens: TrailerTokenMap;
  courseDurations: CourseDurationsMap;
  cardContent?: (course: Course) => React.ReactNode;
  cardAsLink?: boolean;
  containerStyles?: string;
}

export default function CourseCarousel({ data, cardContent, containerStyles }: CourseCarouselProps) {
  return (
    <CardCarousel
      containerStyles={containerStyles}
      title={data.title}
      subtitle={data.description}
      items={data.courses.map((course, index) => (
        <div
          key={course.sys.id}
          id={`${data.title}-section-course-${index}`}
          className={`flex-shrink-0 w-small-card md:w-card`}
        >
          <CourseCard
            course={course}
            cardContent={cardContent}
            imageSizes="(max-width: 768px) 75vw, (max-width: 1024px) 50vw, (max-width: 1280px) 30vw, 310px"
          />
        </div>
      ))}
    />
  );
}
