import { useQuery } from '@tanstack/react-query';
import { getUserEnrolledCourses, QK_USER_ENROLLED_COURSES } from '../utils/queries';

export function useUserEnrolledCourses(email?: string) {
  const { data, error } = useQuery({
    queryKey: [QK_USER_ENROLLED_COURSES],
    queryFn: getUserEnrolledCourses,
    enabled: Boolean(email),
  });

  if (data && !error) {
    return data;
  }

  return [];
}
