import StatBox from '../../../components/StatBox';
import { getViewsForCourseId } from '../data-functions';

async function CourseViewsStat({ courseId }: { courseId: string }) {
  const views = await getViewsForCourseId(courseId);
  return <StatBox title="Total Views (Last 30 Days)" stat={views} />;
}

export default CourseViewsStat;
