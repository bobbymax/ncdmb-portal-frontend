import React from "react";

export interface TimelineNode {
  id: string;
  title: string;
  description?: string;
  status: "completed" | "current" | "pending";
  timestamp?: string;
  icon?: string; // Can be a Remix icon class or "image:path/to/image"
  metadata?: Record<string, any>;
}

interface TimelineProps {
  nodes: TimelineNode[];
  className?: string;
  showTimestamps?: boolean;
  showIcons?: boolean;
  compact?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({
  nodes,
  className = "",
  showTimestamps = true,
  showIcons = true,
  compact = false,
}) => {
  const getStatusColor = (status: TimelineNode["status"]) => {
    switch (status) {
      case "completed":
        return "var(--color-bttn-success)";
      case "current":
        return "var(--color-primary)";
      case "pending":
        return "var(--color-border)";
      default:
        return "var(--color-border)";
    }
  };

  const getStatusIcon = (status: TimelineNode["status"]) => {
    switch (status) {
      case "completed":
        return "ri-check-line";
      case "current":
        return "ri-time-line";
      case "pending":
        return "ri-circle-line";
      default:
        return "ri-circle-line";
    }
  };

  const getStatusBackground = (status: TimelineNode["status"]) => {
    switch (status) {
      case "completed":
        return "var(--color-bttn-success)";
      case "current":
        return "var(--color-primary)";
      case "pending":
        return "var(--color-white)";
      default:
        return "var(--color-white)";
    }
  };

  return (
    <div className={`timeline ${className}`}>
      {nodes.map((node, index) => (
        <div
          key={node.id}
          className={`timeline__item ${
            node.status === "completed" ? "passed" : ""
          }`}
        >
          {/* Timeline Line */}
          {index < nodes.length - 1 && (
            <div
              className="timeline__line"
              style={{
                backgroundColor: getStatusColor(node.status),
              }}
            />
          )}

          {/* Timeline Node */}
          <div className="timeline__node">
            <div className={`timeline__node-icon ${node.status}`}>
              {showIcons && (
                <>
                  {node.icon?.startsWith("image:") ? (
                    <img
                      src={node.icon.replace("image:", "")}
                      alt="Stage icon"
                      className="timeline__node-image"
                    />
                  ) : (
                    <i className={node.icon || getStatusIcon(node.status)} />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Timeline Content */}
          <div className="timeline__content">
            <div className="timeline__header">
              <h4
                className="timeline__title"
                style={{
                  color:
                    node.status === "current"
                      ? "var(--color-primary)"
                      : node.status === "completed"
                      ? "var(--color-primary-coresponding)"
                      : "var(--color-primary-coresponding)",
                  fontWeight: node.status === "current" ? "600" : "500",
                }}
              >
                {node.title}
              </h4>
              {showTimestamps && node.timestamp && (
                <span className="timeline__timestamp">{node.timestamp}</span>
              )}
            </div>

            {node.description && (
              <p className="timeline__description">{node.description}</p>
            )}

            {/* Status Badge */}
            <div className="timeline__status">
              <span
                className="timeline__status-badge"
                style={{
                  backgroundColor: getStatusColor(node.status),
                  color:
                    node.status === "pending"
                      ? "var(--color-primary-coresponding)"
                      : "var(--color-white)",
                }}
              >
                {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
              </span>
            </div>

            {/* Metadata Display */}
            {node.metadata && Object.keys(node.metadata).length > 0 && (
              <div className="timeline__metadata">
                {Object.entries(node.metadata).map(([key, value]) => (
                  <div key={key} className="timeline__metadata-item">
                    <small className="timeline__metadata-label">{key}:</small>
                    <span className="timeline__metadata-value">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
