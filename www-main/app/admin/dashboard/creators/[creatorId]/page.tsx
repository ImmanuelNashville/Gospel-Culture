import { getCreator } from './data-functions';
import CreatorViewsStat from './components/CreatorViewsStat';
import CreatorWatchTimeStat from './components/CreatorWatchTimeStat';
import CreatorViewsChart from './components/CreatorViewsChart';

async function CreatorDashboardPage({ params }: { params: { creatorId: string } }) {
  const creator = await getCreator(params.creatorId);
  return (
    <>
      <h2 className="text-headline6 font-bold dark:text-gray-200">{creator.fields.name}</h2>
      <div className="my-6">
        <dl className="grid grid-cols-2 gap-3">
          {/* @ts-expect-error Async Server Component */}
          <CreatorViewsStat creatorId={params.creatorId} />
          {/* @ts-expect-error Async Server Component */}
          <CreatorWatchTimeStat creatorId={params.creatorId} />
        </dl>
        {/* @ts-expect-error Async Server Component */}
        <CreatorViewsChart creatorId={params.creatorId} />
      </div>
    </>
  );
}

export default CreatorDashboardPage;
