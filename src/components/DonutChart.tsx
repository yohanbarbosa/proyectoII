import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);


function DonutChart() {
  const data = {
    labels: ["Ventas", "Gastos", "Ganancia"],
    datasets: [
      {
        data: [50000, 30000, 45000],
        backgroundColor: [
          "#3B82F6", // azul
          "#EF4444", // rojo
          "#22C55E", // verde
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: "70%", // 🔥 hace el efecto donut
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="flex items-center justify-center mb-3 relative h-35">
      <Doughnut data={data} options={options} />

      {/* Texto en el centro */}
      <div className="absolute text-center">
        <p className="text-[10px] text-gray-400">Total Sales</p>
        <p className="text-sm font-bold text-gray-900">$125,000</p>
      </div>
    </div>
  );
}

export default DonutChart;