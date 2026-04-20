import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
function RevenueChart() {
  const data = {
    labels: ["Ene", "Feb", "Mar"],
    datasets: [
      {
        label: "Ingresos",
        data: [500, 800, 600],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: "200px", position: "relative" }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default RevenueChart;