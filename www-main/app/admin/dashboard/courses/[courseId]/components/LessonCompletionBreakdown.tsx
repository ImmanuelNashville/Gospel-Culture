import CompletionBreakdown from './CompletionBreakdown';
import StatBox from '../../../components/StatBox';
import { getLessonCompletionBreakdown } from '../data-functions';

async function LessonCompletionBreakdown({ courseId }: { courseId: string }) {
  const lessonBreakdown = await getLessonCompletionBreakdown(courseId);

  return (
    <StatBox
      title="Lesson Completion Breakdown (All-time)"
      stat={
        <>
          <p className="font-bodycopy text-sm text-bt-teal-dark/70 dark:text-bt-teal-light/60">
            Percentage of enrolled users who have completed each lesson
          </p>
          <div className="my-6">
            <CompletionBreakdown data={lessonBreakdown} />
          </div>
        </>
      }
    />
  );
}

export default LessonCompletionBreakdown;
