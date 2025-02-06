import CompletionBreakdown from './CompletionBreakdown';
import StatBox from '../../../components/StatBox';
import { getChapterCompletionBreakdown } from '../data-functions';

async function ChapterCompletionBreakdown({ courseId }: { courseId: string }) {
  const chapterBreakdown = await getChapterCompletionBreakdown(courseId);

  return (
    <StatBox
      title="Chapter Completion Breakdown (All-time)"
      stat={
        <>
          <p className="font-bodycopy text-sm text-bt-teal-dark/70 dark:text-bt-teal-light/60">
            Percentage of enrolled users who have complted each chapter (by completing all the lessons in that chapter)
          </p>
          <div className="my-6">
            <CompletionBreakdown data={chapterBreakdown} />
          </div>
        </>
      }
    />
  );
}

export default ChapterCompletionBreakdown;
