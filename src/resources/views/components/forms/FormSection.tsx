import React from "react";

interface FormSectionProps {
  title: string;
  icon: string;
  iconClass?: string;
  headerStyle?: "primary" | "blue" | "yellow" | "green" | "purple";
  children: React.ReactNode;
  width?: "full" | "half";
  height?: "auto" | "full";
}

/**
 * Reusable form section component with card styling
 * Provides consistent card headers with icons and color themes
 */
const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon,
  iconClass,
  headerStyle = "primary",
  children,
  width = "full",
  height = "auto",
}) => {
  const colClass = width === "full" ? "col-md-12" : "col-md-6";
  const heightClass = height === "full" ? "h-100" : "";
  const headerClass = `card-header card-header-${headerStyle}`;
  const iconColorClass = iconClass || `icon-${headerStyle}`;

  return (
    <div className={`${colClass} mb-4`}>
      <div className={`card shadow-sm ${heightClass}`}>
        <div className={headerClass}>
          <h6 className="mb-0 text-dark">
            <i className={`${icon} me-2 ${iconColorClass}`}></i>
            {title}
          </h6>
        </div>
        <div className="card-body">
          <div className="row">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default FormSection;

