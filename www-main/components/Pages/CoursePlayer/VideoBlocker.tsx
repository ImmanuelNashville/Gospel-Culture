type BlockerType = 'user' | 'subscription' | 'purchase' | 'unreleased' | null;
type Blocker = { type: BlockerType; message: string };
export type BlockerMap = {
  videos: Blocker | null;
  resources: Blocker | null;
};

export const VideoBlocker = ({
  blockers,
  courseId,
  nextLessonId,
}: {
  blockers: BlockerMap['videos'];
  courseId: string;
  nextLessonId: string | undefined;
}) => {
  let content;

  if (blockers?.type === 'purchase') {
    content = (
      <p>
        <a className="underline" href="">
          Buy this course
        </a>{' '}
        to unlock all videos
      </p>
    );
  }

  if (blockers?.type === 'user') {
    content = (
      <p>
        <a
          className="underline"
          href={`/api/auth/login?returnTo=${encodeURIComponent(
            `/api/free-enroll?courseId=${courseId}${nextLessonId ? '&v=' + nextLessonId : ''}`
          )}`}
        >
          Sign up
        </a>{' '}
        for free to unlock all videos
      </p>
    );
  }

  if (blockers?.type === 'subscription') {
    content = (
      <p>
        <a className="underline" href={`/subscription?term=annual`}>
          Subscribe
        </a>{' '}
        to unlock all videos
      </p>
    );
  }

  return (
    <div className="font-bodycopy text-center relative w-full rounded-lg bg-gradient-to-tr from-bt-orange to-bt-orange-light dark:to-bt-orange-light/30 p-4 text-white">
      {content}
    </div>
  );
};
