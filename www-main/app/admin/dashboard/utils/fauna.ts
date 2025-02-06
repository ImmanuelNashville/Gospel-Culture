import { createFaunaClientWithQ, FAUNA_MAX_PAGE_SIZE } from 'fauna/setup';

export type Enrollment = FaunaDocument<EnrollmentData>;

interface FaunaDocument<Data> {
  ref: any;
  ts: number;
  data: Data;
}

interface EnrollmentData {
  email: string;
  enrolled: boolean;
  courseId: string;
  orderId: string;
}

export async function getEnrollmentsForCourse(courseId: string) {
  const { faunaClient, q } = createFaunaClientWithQ({ forceProd: true });

  const response = await faunaClient.query<FaunaDocument<FaunaDocument<EnrollmentData>[]>>(
    q.Map(
      q.Paginate(q.Match(q.Index('user_courses_by_course_id'), courseId), { size: FAUNA_MAX_PAGE_SIZE }),
      q.Lambda('user_course', q.Get(q.Var('user_course')))
    )
  );

  return response.data;
}

interface ProgressData {
  userEmail: string;
  courseId: string;
  completedLessons: string[];
  bookmarkedLessons: string[];
  videoProgress: Record<string, number>;
}

export async function getProgressItemsForCourse(courseId: string) {
  const { faunaClient, q } = createFaunaClientWithQ({ forceProd: true });

  const response = await faunaClient.query<FaunaDocument<FaunaDocument<ProgressData>[]>>(
    q.Map(
      q.Paginate(q.Match(q.Index('user_course_progress_by_course_id'), courseId), { size: FAUNA_MAX_PAGE_SIZE }),
      q.Lambda('user_course_progress', q.Get(q.Var('user_course_progress')))
    )
  );

  return response.data;
}
