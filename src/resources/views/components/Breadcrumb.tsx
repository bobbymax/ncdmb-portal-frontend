import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBreadcrumbs, useParentPath, BreadcrumbItem } from "app/Hooks/useBreadcrumbs";

interface BreadcrumbProps {
  customItems?: BreadcrumbItem[];
  showIcons?: boolean;
  showBack?: boolean;
  compact?: boolean;
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  customItems,
  showIcons = true,
  showBack = true,
  compact = false,
  className = "",
}) => {
  const breadcrumbs = useBreadcrumbs();
  const parentPath = useParentPath();
  const navigate = useNavigate();
  const items = customItems || breadcrumbs;

  // Don't show if only home/dashboard
  if (items.length <= 1) {
    return null;
  }

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(parentPath);
  };

  return (
    <nav
      aria-label="breadcrumb"
      className={`breadcrumb-navigation ${compact ? "breadcrumb-compact" : ""} ${className}`}
    >
      <div className="breadcrumb-inner">
        {/* Back Button */}
        {showBack && (
          <button
            className="breadcrumb-back-button"
            onClick={handleBackClick}
            aria-label="Go back"
            title="Go back"
          >
            <i className="ri-arrow-left-s-line"></i>
            <span className="back-label">Back</span>
          </button>
        )}

        {/* Breadcrumb Trail */}
        <ol className="breadcrumb-trail">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li
                key={`${item.path}-${index}`}
                className={`breadcrumb-item ${item.isActive ? "active" : ""}`}
              >
                {item.isActive ? (
                  <span className="breadcrumb-current">
                    {showIcons && item.icon && (
                      <i className={`${item.icon} breadcrumb-icon`}></i>
                    )}
                    <span className="breadcrumb-label">{item.label}</span>
                  </span>
                ) : (
                  <>
                    <Link
                      to={item.path}
                      className="breadcrumb-link"
                      title={item.label}
                    >
                      {showIcons && item.icon && (
                        <i className={`${item.icon} breadcrumb-icon`}></i>
                      )}
                      <span className="breadcrumb-label">{item.label}</span>
                    </Link>
                    {!isLast && (
                      <i className="ri-arrow-right-s-line breadcrumb-divider"></i>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;

