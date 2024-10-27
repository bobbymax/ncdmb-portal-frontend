import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ChartData,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Barchart = ({
  details = {} as ChartData<
    "bar",
    (number | [number, number] | null)[],
    unknown
  >,
}) => {
  const options = {};
  return <Bar options={options} data={details} />;
};

export default Barchart;
