import React from "react";

interface ResourceLoaderProps {
  isLoading?: boolean;
  message?: string;
  size?: "small" | "medium" | "large";
  variant?: "spinner" | "dots" | "skeleton" | "character";
  className?: string;
  children?: React.ReactNode;
}

const ResourceLoader: React.FC<ResourceLoaderProps> = ({
  isLoading = false,
  message = "Loading...",
  size = "medium",
  variant = "character",
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
        return (
          <div className="resource-loader__spinner">
            <div className="spinner"></div>
          </div>
        );
      case "character":
      default:
        return (
          <div className="resource-loader__character">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              className="character-svg"
            >
              {/* Office Worker Character */}
              <defs>
                <linearGradient
                  id="bodyGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#4F46E5", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#3730A3", stopOpacity: 1 }}
                  />
                </linearGradient>
                <linearGradient
                  id="tieGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#EF4444", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#DC2626", stopOpacity: 1 }}
                  />
                </linearGradient>
                <linearGradient
                  id="hairGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#92400E", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#78350F", stopOpacity: 1 }}
                  />
                </linearGradient>
              </defs>

              {/* Body */}
              <rect
                x="25"
                y="35"
                width="30"
                height="35"
                rx="15"
                fill="url(#bodyGradient)"
                className="character-body"
              />

              {/* Tie */}
              <path
                d="M 40 35 L 35 50 L 40 55 L 45 50 Z"
                fill="url(#tieGradient)"
                className="character-tie"
              />

              {/* Head */}
              <circle
                cx="40"
                cy="25"
                r="12"
                fill="#FCD34D"
                className="character-head"
              />

              {/* Hair */}
              <path
                d="M 28 20 Q 40 15 52 20 Q 50 25 48 22 Q 40 18 32 22 Q 30 25 28 20"
                fill="url(#hairGradient)"
                className="character-hair"
              />

              {/* Eyes */}
              <circle
                cx="36"
                cy="22"
                r="2"
                fill="#1F2937"
                className="character-eye left-eye"
              />
              <circle
                cx="44"
                cy="22"
                r="2"
                fill="#1F2937"
                className="character-eye right-eye"
              />

              {/* Glasses */}
              <circle
                cx="36"
                cy="22"
                r="4"
                fill="none"
                stroke="#1F2937"
                strokeWidth="1"
                className="character-glasses left-glasses"
              />
              <circle
                cx="44"
                cy="22"
                r="4"
                fill="none"
                stroke="#1F2937"
                strokeWidth="1"
                className="character-glasses right-glasses"
              />
              <line
                x1="40"
                y1="22"
                x2="40"
                y2="22"
                stroke="#1F2937"
                strokeWidth="1"
                className="character-glasses-bridge"
              />

              {/* Arms */}
              <rect
                x="20"
                y="40"
                width="8"
                height="20"
                rx="4"
                fill="url(#bodyGradient)"
                className="character-arm left-arm"
              />
              <rect
                x="52"
                y="40"
                width="8"
                height="20"
                rx="4"
                fill="url(#bodyGradient)"
                className="character-arm right-arm"
              />

              {/* Hands */}
              <circle
                cx="24"
                cy="62"
                r="3"
                fill="#FCD34D"
                className="character-hand left-hand"
              />
              <circle
                cx="56"
                cy="62"
                r="3"
                fill="#FCD34D"
                className="character-hand right-hand"
              />

              {/* Coffee Cup */}
              <rect
                x="58"
                y="55"
                width="6"
                height="8"
                rx="2"
                fill="#F59E0B"
                className="coffee-cup"
              />
              <rect
                x="59"
                y="56"
                width="4"
                height="6"
                rx="1"
                fill="#FEF3C7"
                className="coffee-steam"
              />
              <path
                d="M 64 57 Q 66 55 68 57"
                stroke="#F59E0B"
                strokeWidth="1"
                fill="none"
                className="coffee-handle"
              />

              {/* Steam Animation */}
              <circle
                cx="60"
                cy="54"
                r="1"
                fill="#E5E7EB"
                className="steam steam-1"
              />
              <circle
                cx="62"
                cy="52"
                r="1"
                fill="#E5E7EB"
                className="steam steam-2"
              />
              <circle
                cx="64"
                cy="54"
                r="1"
                fill="#E5E7EB"
                className="steam steam-3"
              />

              {/* Papers */}
              <rect
                x="18"
                y="58"
                width="8"
                height="10"
                rx="1"
                fill="white"
                stroke="#D1D5DB"
                strokeWidth="0.5"
                className="paper paper-1"
              />
              <rect
                x="20"
                y="60"
                width="4"
                height="1"
                fill="#9CA3AF"
                className="paper-line"
              />
              <rect
                x="20"
                y="62"
                width="3"
                height="1"
                fill="#9CA3AF"
                className="paper-line"
              />
              <rect
                x="20"
                y="64"
                width="5"
                height="1"
                fill="#9CA3AF"
                className="paper-line"
              />

              {/* Sweat Drop */}
              <path
                d="M 45 18 Q 46 20 45 22 Q 44 20 45 18"
                fill="#3B82F6"
                className="sweat-drop"
              />
            </svg>
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
