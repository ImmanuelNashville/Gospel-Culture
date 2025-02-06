import StatBox from '../../../components/StatBox';
import { getWatchTimeForCreatorId } from '../data-functions';

async function CreatorWatchTimeStat({ creatorId }: { creatorId: string }) {
  const watchTime = await getWatchTimeForCreatorId(creatorId);
  return <StatBox title="Total Watch Time (Last 30 Days)" stat={watchTime} />;
}

export default CreatorWatchTimeStat;
