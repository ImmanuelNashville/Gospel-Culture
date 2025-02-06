import StatBox from '../../../components/StatBox';
import { getViewsForCreatorId } from '../data-functions';

async function CreatorViewsStat({ creatorId }: { creatorId: string }) {
  const views = await getViewsForCreatorId(creatorId);
  return <StatBox title="Total Views (Last 30 Days)" stat={views} />;
}

export default CreatorViewsStat;
