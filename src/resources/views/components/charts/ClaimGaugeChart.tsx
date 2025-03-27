import React from "react";
import ReactApexChart from "react-apexcharts";

interface GaugeChartProps {
  score: number; // 0 - 100
  reason?: string;
}

const ClaimGaugeChart: React.FC<GaugeChartProps> = ({ score, reason }) => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "radialBar",
      toolbar: { show: false },
      offsetY: 0,
      fontFamily: "'Poppins', sans-serif",
    },
    plotOptions: {
      radialBar: {
        startAngle: -160,
        endAngle: 160,
        hollow: {
          margin: 0,
          size: "50%",
          background: "#fcfcfc",
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 4,
            color: "#aaa",
            opacity: 0.15,
          },
        },
        track: {
          background: "#e7e7e7",
          strokeWidth: "97%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: true,
            offsetY: -10,
            fontSize: "12px",
            color: "#888",
            fontFamily: "'Poppins', sans-serif",
          },
          value: {
            formatter: (val) => `${val}%`,
            fontSize: "32px",
            fontWeight: "bold",
            fontFamily: "'Poppins', sans-serif",
          },
        },
      },
    },
    fill: {
      colors: [score >= 90 ? "#d63031" : score >= 70 ? "#FFC533" : "#62B58F"],
      type: "solid",
    },
    stroke: {
      lineCap: "round", // <—— This makes the edges rounded!
    },
    labels: [reason?.toUpperCase() ?? "SAFE"],
  };

  return (
    <ReactApexChart
      options={options}
      series={[score]}
      type="radialBar"
      height={250}
    />
  );
};

export default ClaimGaugeChart;
