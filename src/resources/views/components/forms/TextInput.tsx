import React, { ChangeEvent } from "react";

export interface TextInputProps {
  label?: string;
  type?:
    | "text"
    | "password"
    | "hidden"
    | "number"
    | "file"
    | "files"
    | "email"
    | "date"
    | "datetime"
    | "time";
  value?: number | string | undefined;
  size?: "sm" | "md" | "lg" | "xl";
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  isDisabled?: boolean;
  min?: string | number;
  max?: string | number;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  type = "text",
  value,
  size = "lg",
  onChange,
  placeholder,
  name,
  isDisabled = false,
  min,
  max,
  ...attributes
}) => {
  return (
    <div className="storm-form-group flex column mb-3">
      {label && (
        <label className="storm-form-label mb-2" htmlFor={name}>
          {label}:
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`storm-form-control storm-form-${size}`}
        placeholder={placeholder}
        disabled={isDisabled}
        min={min}
        max={max}
        {...attributes}
      />
    </div>
  );
};

export default TextInput;
