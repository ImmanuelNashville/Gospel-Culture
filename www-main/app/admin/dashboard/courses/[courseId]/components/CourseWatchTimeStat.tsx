import StatBox from '../../../components/StatBox';
import { getWatchTimeForCourseId } from '../data-functions';

async function CourseWatchTimeStat({ courseId }: { courseId: string }) {
  const watchTime = await getWatchTimeForCourseId(courseId);
  return <StatBox title="Total Watch Time (Last 30 Days)" stat={watchTime} />;
}

export default CourseWatchTimeStat;
