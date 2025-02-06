import { useUserDataContext } from 'hooks/useUserDataContext';
import appConfig from '../../../appConfig';

export function NewVersionBanner({ courseId }: { courseId: string }) {
  const { enrolledCourses } = useUserDataContext();
  const archivedCourse = appConfig.archivedItems.find((archivedItem) => archivedItem.id === courseId);
  const showNewVersionOfferBanner = archivedCourse && archivedCourse.upgradeTo;

  const alreadyEnrolledInNewVersion =
    showNewVersionOfferBanner && enrolledCourses.map((c) => c.sys.id).includes(archivedCourse.upgradeTo);

  const newVersionCopy = alreadyEnrolledInNewVersion
    ? "There's a newer version of this course"
    : "We've updated this course! Since you already own it, we're offering you the updated one for free.";
  const newVersionCTACopy = alreadyEnrolledInNewVersion ? 'Watch the latest version' : 'Unlock the new version';

  return (
    <div className="w-full font-bodycopy bg-bt-teal text-white text-body text-center rounded-lg px-3 py-1.5 flex justify-between mb-2">
      {newVersionCopy}
      <a
        href={`/api/auth/login?returnTo=${encodeURIComponent(`/api/course/upgrade?id=${courseId}`)}`}
        className="underline"
      >
        {newVersionCTACopy}
      </a>
    </div>
  );
}
