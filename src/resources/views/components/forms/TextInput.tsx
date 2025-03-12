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
  value?: number | string | undefined | any;
  size?: "sm" | "md" | "lg" | "xl";
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name?: string;
  isDisabled?: boolean;
  min?: string | number;
  max?: string | number;
  width?: number;
  isMulti?: boolean;
  accept?: string;
  onBlur?: () => void;
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
  width = 100,
  isMulti = false,
  onBlur,
  accept,
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
        onBlur={onBlur}
        className={`storm-form-control storm-form-${size}`}
        placeholder={placeholder}
        disabled={isDisabled}
        multiple={isMulti}
        min={min}
        max={max}
        style={{ width: `${width}%` }}
        accept={accept}
        {...attributes}
      />
    </div>
  );
};

export default TextInput;
