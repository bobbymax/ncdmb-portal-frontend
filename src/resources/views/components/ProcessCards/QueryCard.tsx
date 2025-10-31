import React, { useState } from "react";

interface QueryCardProps {
  query: {
    user_id: number;
    group_id: number;
    document_id: number;
    document_draft_id: number;
    message: string;
    response: unknown;
    priority: "low" | "medium" | "high";
    status: "open" | "closed";
    timestamp: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  isCompact?: boolean;
}

const QueryCard: React.FC<QueryCardProps> = ({
  query,
  onEdit,
  onDelete,
  isCompact = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColors = {
    high: {
      bg: "#fef2f2",
      border: "#ef4444",
      text: "#dc2626",
      badge: "#fee2e2",
    },
    medium: {
      bg: "#fffbeb",
      border: "#f59e0b",
      text: "#d97706",
      badge: "#fef3c7",
    },
    low: {
      bg: "#f9fafb",
      border: "#9ca3af",
      text: "#4b5563",
      badge: "#f3f4f6",
    },
  };

  const colors = priorityColors[query.priority];

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000 / 60);

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div
      className="query-card"
      style={{
        border: `2px solid ${colors.border}`,
        borderRadius: "8px",
        padding: "12px 16px",
        background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.badge} 100%)`,
        width: "100%",
        transition: "all 0.3s ease",
      }}
    >
      <div className="d-flex align-items-start gap-3">
        {/* Icon */}
        <div
          style={{
            fontSize: "1.5rem",
            color: colors.text,
            marginTop: "2px",
          }}
        >
          <i className="ri-question-line"></i>
        </div>

        {/* Content */}
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: "600",
                textTransform: "uppercase",
                color: colors.text,
                backgroundColor: colors.badge,
                padding: "3px 8px",
                borderRadius: "4px",
                border: `1px solid ${colors.border}`,
              }}
            >
              {query.priority} Priority
            </span>
            <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
              {getTimeAgo(query.timestamp)}
            </span>
          </div>

          <p
            style={{
              fontSize: "0.85rem",
              color: "#374151",
              lineHeight: "1.4",
              margin: "0 0 8px 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: isExpanded ? "unset" : 2,
              WebkitBoxOrient: "vertical",
              cursor: "pointer",
            }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {query.message}
          </p>

          {query.message.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                background: "none",
                border: "none",
                padding: "0",
                fontSize: "0.75rem",
                color: colors.text,
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="d-flex gap-1">
          <button
            onClick={onEdit}
            style={{
              background: "rgba(0,0,0,0.05)",
              border: "none",
              borderRadius: "6px",
              padding: "6px 8px",
              cursor: "pointer",
              transition: "all 0.2s",
              fontSize: "0.9rem",
              color: colors.text,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(0,0,0,0.05)";
            }}
            title="Edit query"
          >
            <i className="ri-edit-line"></i>
          </button>
          <button
            onClick={onDelete}
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "none",
              borderRadius: "6px",
              padding: "6px 8px",
              cursor: "pointer",
              transition: "all 0.2s",
              fontSize: "0.9rem",
              color: "#dc2626",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#fee2e2";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
            }}
            title="Delete query"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueryCard;
