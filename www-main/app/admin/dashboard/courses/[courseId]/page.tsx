import CourseViewsChart from './components/CourseViewsChart';
import CourseViewsStat from './components/CourseViewsStat';
import CourseWatchTimeStat from './components/CourseWatchTimeStat';
import TotalEnrollments from './components/TotalEnrollments';
import LessonCompletionBreakdown from './components/LessonCompletionBreakdown';
import { getFullCourse } from './data-functions';
import ChapterCompletionBreakdown from './components/ChapterCompletionBreakdown';

async function CourseDashboardPage({ params }: { params: { courseId: string } }) {
  const course = await getFullCourse(params.courseId);
  return (
    <>
      <h2 className="text-headline6 font-bold dark:text-gray-200">{course.fields.title}</h2>
      <p className="font-bodycopy dark:text-gray-300">by {course.fields.creator?.fields.name ?? 'Unknown Creator'}</p>
      <div className="my-6">
        <dl className="grid grid-cols-2 gap-3">
          {/* @ts-expect-error Async Server Component */}
          <CourseViewsStat courseId={params.courseId} />
          {/* @ts-expect-error Async Server Component */}
          <CourseWatchTimeStat courseId={params.courseId} />
        </dl>
        {/* @ts-expect-error Async Server Component */}
        <CourseViewsChart courseId={params.courseId} />
        <dl className="space-y-3 my-3">
          {/* @ts-expect-error Async Server Component */}
          <TotalEnrollments courseId={params.courseId} />
          {/* @ts-expect-error Async Server Component */}
          <LessonCompletionBreakdown courseId={params.courseId} />
          {/* @ts-expect-error Async Server Component */}
          <ChapterCompletionBreakdown courseId={params.courseId} />
        </dl>
      </div>
    </>
  );
}

export default CourseDashboardPage;
