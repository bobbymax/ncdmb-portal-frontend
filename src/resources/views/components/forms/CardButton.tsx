import React from "react";
import { ButtonProps } from "./Button";

const CardButton: React.FC<ButtonProps> = ({
  label,
  variant = "dark",
  type = "button",
  size = "md",
  icon = "",
  isDisabled = false,
  rounded = false,
  handleClick = undefined,
}) => {
  return (
    <div className="bttn-group flex align gap-md">
      <button
        type={type}
        className={`card-bttn ${variant} card-bttn-${size} ${
          rounded && !label ? "bttn-circle" : ""
        }`}
        onClick={handleClick}
        disabled={isDisabled}
      >
        <i className={icon} />
        {label && <small>{label}</small>}
      </button>
    </div>
  );
};

export default CardButton;
