import React from "react";

interface ResourceLoaderProps {
  isLoading?: boolean;
  message?: string;
  size?: "small" | "medium" | "large";
  variant?: "spinner" | "dots" | "skeleton";
  className?: string;
  children?: React.ReactNode;
}

const ResourceLoader: React.FC<ResourceLoaderProps> = ({
  isLoading = false,
  message = "Loading...",
  size = "medium",
  variant = "spinner",
  className = "",
  children,
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  const sizeClasses = {
    small: "resource-loader--small",
    medium: "resource-loader--medium",
    large: "resource-loader--large",
  };

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="resource-loader__dots">
            <span className="dot dot1"></span>
            <span className="dot dot2"></span>
            <span className="dot dot3"></span>
          </div>
        );
      case "skeleton":
        return (
          <div className="resource-loader__skeleton">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
        );
      case "spinner":
      default:
        return (
          <div className="resource-loader__spinner">
            <div className="spinner"></div>
          </div>
        );
    }
  };

  return (
    <div className={`resource-loader ${sizeClasses[size]} ${className}`}>
      {renderLoader()}
      {message && (
        <div className="resource-loader__message">
          {message}
          <span className="dotted dotted1">.</span>
          <span className="dotted dotted2">.</span>
          <span className="dotted dotted3">.</span>
        </div>
      )}
    </div>
  );
};

export default ResourceLoader;
