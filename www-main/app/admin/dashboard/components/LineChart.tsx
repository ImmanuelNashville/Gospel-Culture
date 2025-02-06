'use client';
import { ChartData } from 'app/admin/dashboard/utils/mux';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';

import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const options = {
  responsive: true,
  legend: {
    display: false,
  },
  plugins: {
    title: {
      display: false,
    },
  },
};

function LineChart({ id, data }: { id: string; data: ChartData }) {
  return (
    <Line
      options={options}
      datasetIdKey={`views-over-time-${id}`}
      data={{
        labels: data.map((x) =>
          format(new Date(x.date).getTime() + new Date().getTimezoneOffset() * 60 * 1000, 'MMM d')
        ),
        datasets: [
          {
            fill: true,
            label: 'Views',
            data: data.map((x) => x.views),
            borderColor: '#085966',
            backgroundColor: '#6CA8B2',
          },
        ],
      }}
    />
  );
}

export default LineChart;
