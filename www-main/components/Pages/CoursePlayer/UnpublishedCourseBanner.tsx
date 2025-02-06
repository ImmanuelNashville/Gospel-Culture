export function UnpublishedCourseBanner({ courseId }: { courseId: string }) {
  return (
    <div className="w-full bg-amber-400 text-black text-body font-bold text-center rounded-lg px-3 py-1 pt-1.5 flex justify-between mb-2">
      <p>YOU ARE PREVIEWING AN UNPUBLISHED COURSE</p>
      <a
        className="underline"
        href={`https://app.contentful.com/spaces/bhsr3r63z25m/entries/${courseId}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Course in Contentful
      </a>
    </div>
  );
}
