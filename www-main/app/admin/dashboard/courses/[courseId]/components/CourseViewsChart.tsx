import { formatTimeseriesDataForChart, getMuxViews, MuxMetricsTimeseriesResponse } from 'app/admin/dashboard/utils/mux';
import LineChart from '../../../components/LineChart';

async function CourseViewsChart({ courseId }: { courseId: string }) {
  const data = (await getMuxViews('timeseries', 'course', courseId, '30:days')) as MuxMetricsTimeseriesResponse;
  const chartData = formatTimeseriesDataForChart(data);
  return (
    <div className="my-2 p-6 rounded-2xl bg-bt-teal-ultraLight/5">
      <h3 className="font-bodycopy text-subtitle1 text-bt-teal-dark mb-4 dark:text-bt-teal-light">
        Views Over Time (Last 30 Days)
      </h3>
      <div className="h-80 w-full">
        <LineChart id={courseId} data={chartData} />
      </div>
    </div>
  );
}

export default CourseViewsChart;
