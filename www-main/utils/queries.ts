import { Course } from '../models/contentful';
import { FaunaUserData } from '../models/fauna';
import { CoursesProgressAPIResponse } from '../pages/api/courses-progress';
import { SubscriptionDetailsApiResponse } from '../pages/api/subscription/active';

export const QK_AUTHED_USER_RECOMMENDATIONS = 'authedUserRecommendations';
export const getAuthedUserRecommendations = async () => {
  const response = await fetch('/api/recommendations');
  if (!response.ok) {
    throw new Error('Failed to fetch recommended courses');
  }
  const data: Course[] = await response.json();
  return data;
};

export const QK_FAUNA_USER = 'faunaUser';
export const getFaunaUser = async () => {
  const response = await fetch('/api/user');
  if (!response.ok) {
    throw new Error('Failed for fetch user');
  }
  const data: FaunaUserData = await response.json();
  return data;
};

export const QK_ACTIVE_SUBSCRIPTION = 'activeSubscription';
export const getActiveSubscription = async () => {
  const response = await fetch(`/api/subscription/active`);
  if (!response.ok) {
    throw new Error('Failed to fetch active subscription status');
  }
  const data: SubscriptionDetailsApiResponse = await response.json();
  return data;
};

export const QK_USER_COURSES_PROGRESS = 'userCoursesProgress';
export const getUserCoursesProgress = async () => {
  const response = await fetch('/api/courses-progress');
  if (!response.ok) {
    throw new Error('Failed to fetch courses progress');
  }
  const data: CoursesProgressAPIResponse = await response.json();
  return data;
};

export interface MyCourse extends Course {
  id: string;
  type: string;
}
export const QK_USER_ENROLLED_COURSES = 'userEnrolledCourses';
export const getUserEnrolledCourses = async () => {
  const response = await fetch(`/api/my-courses`);
  if (!response.ok) {
    throw new Error('Failed to fetch user enrolled courses');
  }
  const data: MyCourse[] = await response.json();
  return data;
};

export const QK_MIGRATE_AUTHED_USER = 'migrateUser';
export const migrateAuthedUser = async () => {
  const response = await fetch('/api/users/migrate');
  if (!response.ok) {
    throw new Error('Failed to migrate user');
  }
  const data: boolean = await response.json();
  return data;
};
