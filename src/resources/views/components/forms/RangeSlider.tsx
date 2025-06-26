import React, { ChangeEvent, useState } from "react";

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
  return (
    <div className="slider__container">
      <label className="storm-form-label" htmlFor={name}>
        {label}
      </label>
      <input
        type="range"
        name={name}
        min={min ?? 0}
        max={max ?? 0}
        value={value}
        className="slider"
        id={name}
        onChange={onChange}
      />
    </div>
  );
};

export default RangeSlider;
