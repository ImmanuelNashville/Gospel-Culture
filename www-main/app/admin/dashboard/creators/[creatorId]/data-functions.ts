import contentfulClient from 'contentful/contentfulClient';
import humanizeDuration from 'humanize-duration';
import { ContentfulCreatorFields } from 'models/contentful';
import { getMuxViews, MuxMetricsOverallResponse } from '../../utils/mux';
import 'server-only';

export async function getCreator(creatorId: string) {
  const response = await contentfulClient.getEntries<ContentfulCreatorFields>({
    'sys.id': creatorId,
  });
  return response.items[0];
}

export async function getViewsForCreatorId(creatorId: string) {
  try {
    const muxData = (await getMuxViews('overall', 'creator', creatorId, '30:days')) as MuxMetricsOverallResponse;
    return new Intl.NumberFormat().format(muxData.data.total_views);
  } catch (e) {
    console.error(e);
    return '⛔️';
  }
}

export async function getWatchTimeForCreatorId(creatorId: string) {
  try {
    const muxData = (await getMuxViews('overall', 'creator', creatorId, '30:days')) as MuxMetricsOverallResponse;
    return humanizeDuration(Math.round(muxData.data.total_watch_time / (1000 * 60)) * (1000 * 60));
  } catch (e) {
    console.error(e);
    return '⛔️';
  }
}
