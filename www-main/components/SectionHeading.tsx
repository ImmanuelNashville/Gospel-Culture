export function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-300">{title}</h2>
      <p className="font-bodycopy text-gray-500 dark:text-gray-400 mb-4">{description}</p>
    </>
  );
}
