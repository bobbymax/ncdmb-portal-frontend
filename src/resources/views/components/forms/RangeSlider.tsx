import React, { ChangeEvent, useState } from "react";
import "./RangeSlider.css";

export interface RangeSliderProps {
  label: string;
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  min: number;
  max: number;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  onChange,
  name,
  min,
  max,
}) => {
  // Calculate percentage for visual feedback with safety checks
  const safeMin = Number(min) || 0;
  const safeMax = Number(max) || 0;
  const safeValue = Number(value) || 0;

  const percentage =
    safeMax > safeMin ? ((safeValue - safeMin) / (safeMax - safeMin)) * 100 : 0;

  return (
    <div className="range-slider-modern">
      {label && (
        <label className="range-slider-label" htmlFor={name}>
          {label}
        </label>
      )}
      <div className="range-slider-wrapper">
        <div className="range-track-background">
          <div
            className="range-track-fill"
            style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
          ></div>
        </div>
        <input
          type="range"
          name={name}
          min={safeMin}
          max={safeMax}
          value={safeValue}
          className="range-slider-input"
          id={name}
          onChange={onChange}
        />
      </div>
      <div className="range-slider-markers">
        <span className="range-marker-min">Min</span>
        <span className="range-marker-max">Max</span>
      </div>
    </div>
  );
};

export default RangeSlider;
