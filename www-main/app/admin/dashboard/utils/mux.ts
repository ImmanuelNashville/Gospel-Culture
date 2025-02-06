export interface MuxMetricsTimeseriesResponse {
  total_row_count: number;
  timeframe: number[];
  data: [string, number | null, number | null][];
}

export interface MuxMetricsOverallResponse {
  total_row_count: number;
  timeframe: number[];
  meta: {
    aggregation: string;
  };
  data: {
    value: number;
    total_watch_time: number;
    total_views: number;
    total_playing_time: number;
    global_value: null;
  };
}

type MetricType = 'overall' | 'timeseries';
type RequestTimeframe = '60:minutes' | '6:hours' | '24:hours' | '3:days' | '7:days' | '30:days';
type ContentType = '' | 'course' | 'creator';
type EnrollmentType = '' | 'purchase' | 'subscription';

export async function getMuxViews(
  metricType: MetricType = 'overall',
  contentType: ContentType = '',
  id = '',
  timeframe: RequestTimeframe = '30:days',
  enrollmentType: EnrollmentType = ''
) {
  let contentTypeFilter;

  switch (contentType) {
    case 'course':
      contentTypeFilter = `&filters[]=video_series:${id}`;
      break;
    case 'creator':
      contentTypeFilter = `&filters[]=custom_1:${id}`;
      break;
    default:
      break;
  }

  let enrollmentTypeFilter;

  if (enrollmentType) {
    enrollmentTypeFilter = `&filters[]=custom_2:${enrollmentType}`;
  }

  const baseURL = `https://api.mux.com/data/v1/metrics/views/${metricType}`;
  const timeParams = `timeframe[]=${timeframe}`;
  const url = `${baseURL}?${timeParams}${contentTypeFilter ?? ''}${enrollmentTypeFilter ?? ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${process.env.MUX_DATA_ACCESS_TOKEN}:${process.env.MUX_DATA_SECRET_KEY}`)}`,
    },
  });

  if (!response.ok) throw new Error(await response.text());

  const data = await response.json();

  if (metricType === 'overall') return data as MuxMetricsOverallResponse;
  if (metricType === 'timeseries') return data as MuxMetricsTimeseriesResponse;
  throw new Error('invalid timeseries provided. valid options are `overall` and `timeseries`');
}

export type ChartData = {
  date: string;
  views: number;
}[];

export function formatTimeseriesDataForChart(response: MuxMetricsTimeseriesResponse): ChartData {
  return response.data.map((day) => ({
    date: day[0],
    views: day[1] ?? 0,
  }));
}
