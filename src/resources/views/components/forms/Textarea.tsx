import React, { ChangeEvent } from "react";

export interface TextareaProps {
  label?: string;
  value: number | string | undefined;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  name: string;
  isDisabled?: boolean;
  rows: number;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  name,
  isDisabled = false,
  rows = 4,
  ...attributes
}) => {
  return (
    <div className="storm-form-group flex column mb-3">
      {label && (
        <label className="storm-form-label mb-2" htmlFor={name}>
          {label}:
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="storm-form-control storm-form-textarea"
        placeholder={placeholder}
        rows={rows}
        disabled={isDisabled}
        {...attributes}
      />
    </div>
  );
};

export default Textarea;
