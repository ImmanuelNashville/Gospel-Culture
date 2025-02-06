import { UserProfile } from '@auth0/nextjs-auth0/client';
import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode, useMemo } from 'react';
import { useBrightTripUser } from '../hooks/useBrightTripUser';
import { useUserEnrolledCourses } from '../hooks/useUserEnrolledCourses';
import { FaunaUserData } from '../models/fauna';
import { CoursesProgressAPIResponse } from '../pages/api/courses-progress';
import { getUserCoursesProgress, MyCourse, QK_USER_COURSES_PROGRESS } from '../utils/queries';

export const UserDataContext = createContext<UserDataContextFields | undefined>(undefined);

interface UserDataContextFields {
  auth0User?: UserProfile;
  user?: FaunaUserData;
  enrolledCourses: MyCourse[];
  coursesProgress?: CoursesProgressAPIResponse;
}

const UserDataProvider = ({ children }: { children?: ReactNode }) => {
  const { user, auth0User } = useBrightTripUser();
  const enrolledCourses = useUserEnrolledCourses(user?.email);
  const { data: coursesProgress } = useQuery({
    queryKey: [QK_USER_COURSES_PROGRESS],
    queryFn: getUserCoursesProgress,
    enabled: Boolean(user?.email),
  });

  const providerValue: UserDataContextFields = useMemo(
    () => ({
      auth0User,
      user,
      enrolledCourses,
      coursesProgress,
    }),
    [auth0User, user, enrolledCourses, coursesProgress]
  );

  return <UserDataContext.Provider value={providerValue}>{children}</UserDataContext.Provider>;
};

export default UserDataProvider;
