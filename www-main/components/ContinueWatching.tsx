import CourseCarousel from './CourseCarousel';
import appConfig from '../appConfig';
import { TrailerTokenMap } from '../utils/tokens';
import { CourseDurationsMap } from '../utils/courses.server';
import { useUserDataContext } from '../hooks/useUserDataContext';

interface ContinueWatchingProps {
  trailerTokens: TrailerTokenMap;
  courseDurations: CourseDurationsMap;
  subscriptionOnly?: boolean;
}

export default function ContinueWatching({
  trailerTokens,
  courseDurations,
  subscriptionOnly = false,
}: ContinueWatchingProps) {
  const { coursesProgress } = useUserDataContext();

  if (!coursesProgress) {
    return null;
  }

  const coursesToShow = subscriptionOnly
    ? coursesProgress.coursesInProgress.filter((c) => appConfig.subscriptionCourses.includes(c.sys.id))
    : coursesProgress.coursesInProgress;

  if (coursesToShow.length === 0) {
    return null;
  }

  return (
    <CourseCarousel
      trailerTokens={trailerTokens}
      courseDurations={courseDurations}
      data={{
        title: 'Continue Watching',
        description: 'Jump back in and pick up right where you left off',
        courses: coursesToShow,
        progressData: coursesProgress.progressPercentages,
      }}
      cardAsLink
      containerStyles="pb-4"
    />
  );
}
