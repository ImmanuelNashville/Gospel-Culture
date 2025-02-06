import { useQuery } from '@tanstack/react-query';
import { useBrightTripUser } from '../hooks/useBrightTripUser';
import { CourseDurationsMap } from '../utils/courses.server';
import { QK_AUTHED_USER_RECOMMENDATIONS, getAuthedUserRecommendations } from '../utils/queries';
import { TrailerTokenMap } from '../utils/tokens';
import CourseCarousel from './CourseCarousel';

interface RecommendedCoursesProps {
  trailerTokens: TrailerTokenMap;
  courseDurations: CourseDurationsMap;
}

export default function RecommendedCourses({ trailerTokens, courseDurations }: RecommendedCoursesProps) {
  const { user } = useBrightTripUser();
  const { data, error } = useQuery({
    queryKey: [QK_AUTHED_USER_RECOMMENDATIONS],
    queryFn: getAuthedUserRecommendations,
    enabled: Boolean(user),
  });

  if (user && data && !error) {
    return (
      <CourseCarousel
        data={{
          title: 'Recommended Courses',
          description: "Based on what you've watched, we think you'll like these",
          courses: data,
        }}
        trailerTokens={trailerTokens}
        courseDurations={courseDurations}
        containerStyles="pb-4"
      />
    );
  }

  return null;
}
