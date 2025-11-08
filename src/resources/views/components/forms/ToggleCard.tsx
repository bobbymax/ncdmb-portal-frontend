import React from "react";

interface ToggleCardProps {
  title: string;
  description: string;
  icon?: string;
  iconColor?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  checkedLabel?: string;
  uncheckedLabel?: string;
  disabled?: boolean;
}

/**
 * Reusable toggle card component with switch
 * Provides consistent toggle UI with icon, title, description, and switch
 */
const ToggleCard: React.FC<ToggleCardProps> = ({
  title,
  description,
  icon,
  iconColor = "#66bb6a",
  checked,
  onChange,
  checkedLabel = "Enabled",
  uncheckedLabel = "Disabled",
  disabled = false,
}) => {
  const id = `toggle-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="col-md-12 mb-4">
      <div className="card border-0 bg-light">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div className="flex-grow-1">
              <h6 className="mb-1 fw-semibold">
                {icon && (
                  <i className={`${icon} me-2`} style={{ color: iconColor }}></i>
                )}
                {title}
              </h6>
              <small className="text-muted">{description}</small>
            </div>
            <div className="form-check form-switch ms-3">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id={id}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                style={{ width: "3rem", height: "1.5rem" }}
              />
              <label className="form-check-label ms-2 fw-semibold" htmlFor={id}>
                {checked ? checkedLabel : uncheckedLabel}
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToggleCard;

