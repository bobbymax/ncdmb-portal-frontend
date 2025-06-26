// CircularProgressBar.tsx
import React, { useEffect, useState } from "react";

interface CircularProgressBarProps {
  min: number;
  max: number;
  currentValue: number;
  callback?: (color: string) => void;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  min,
  max,
  currentValue,
  callback,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const percentage = Math.min(
      Math.max(((currentValue - min) / (max - min)) * 100, 0),
      100
    );
    setProgress(percentage);
  }, [min, max, currentValue]);

  const radius = 60;
  const stroke = 21;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Determine progress color
  const getProgressColor = () => {
    if (progress < 50) return "#8B0000"; // red
    if (progress < 75) return "#D48806"; // yellow
    return "#206A4D"; // green
  };

  useEffect(() => {
    if (callback) {
      callback(getProgressColor());
    }
  }, [callback, getProgressColor]);

  return (
    <div className="progress-container">
      <svg
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle
          stroke="#eee"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={getProgressColor()}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="progress-circle"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="18"
          fill="#333"
        >
          {Math.round(progress)}%
        </text>
      </svg>
    </div>
  );
};

export default CircularProgressBar;
