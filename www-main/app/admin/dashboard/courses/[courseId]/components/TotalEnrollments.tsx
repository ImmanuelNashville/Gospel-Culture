import StatBox from '../../../components/StatBox';
import { getEnrollmentsForCourse } from '../../../utils/fauna';

async function TotalEnrollments({ courseId }: { courseId: string }) {
  const enrollments = await getEnrollmentsForCourse(courseId);
  const stat = String(enrollments.length);

  return <StatBox title="Total Enrollments (All-time)" stat={stat} />;
}

export default TotalEnrollments;
