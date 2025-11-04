import { ProjectResponseData } from "@/app/Repositories/Project/data";
import Button from "../forms/Button";
import moment from "moment";

const projectTypeIcons = {
  capital: "ri-building-line",
  operational: "ri-tools-line",
  maintenance: "ri-hammer-line",
  research: "ri-flask-line",
  infrastructure: "ri-road-map-line",
};

const projectTypeColors = {
  capital: "#5a9279",
  operational: "#4caf50",
  maintenance: "#ff9800",
  research: "#2196f3",
  infrastructure: "#9c27b0",
};

const priorityBadges = {
  critical: { icon: "ri-error-warning-line", color: "#dc3545" },
  high: { icon: "ri-alarm-warning-line", color: "#ff9800" },
  medium: { icon: "ri-information-line", color: "#2196f3" },
  low: { icon: "ri-checkbox-circle-line", color: "#4caf50" },
};

const ProjectCard = ({
  data,
  handleAction,
}: {
  data: ProjectResponseData;
  handleAction: (projectId: number, action: "manage" | "memo" | "tb") => void;
}) => {
  const {
    id,
    title,
    proposed_start_date,
    proposed_end_date,
    description,
    status,
    project_type,
    priority,
    total_proposed_amount,
    physical_progress_percentage,
  } = data;

  const projectIcon = projectTypeIcons[project_type] || "ri-folder-line";
  const projectColor = projectTypeColors[project_type] || "#5a9279";
  const priorityConfig = priorityBadges[priority] || priorityBadges.medium;

  return (
    <div className="modern-project-card">
      {/* Priority Badge */}
      <div className="project-priority-badge" style={{ borderColor: priorityConfig.color }}>
        <i className={priorityConfig.icon} style={{ color: priorityConfig.color }}></i>
      </div>

      {/* Header */}
      <div className="project-card-header">
        <div className="project-icon-wrapper" style={{ backgroundColor: `${projectColor}15` }}>
          <i className={projectIcon} style={{ color: projectColor }}></i>
        </div>
        <div className="project-title-section">
          <h5 className="project-card-title">{title}</h5>
          <div className="project-meta">
            <span className="project-type-badge" style={{ color: projectColor }}>
              {project_type}
            </span>
            <span className="project-separator">•</span>
            <span className="project-status-text">{status}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="project-description">{description || "No description provided"}</p>

      {/* Progress Bar */}
      <div className="project-progress-section">
        <div className="progress-label-row">
          <small className="progress-label">Physical Progress</small>
          <small className="progress-value">{physical_progress_percentage}%</small>
        </div>
        <div className="project-progress-bar">
          <div
            className="project-progress-fill"
            style={{
              width: `${physical_progress_percentage}%`,
              backgroundColor: projectColor,
            }}
          ></div>
        </div>
      </div>

      {/* Timeline & Budget */}
      <div className="project-info-grid">
        <div className="project-info-item">
          <i className="ri-calendar-check-line" style={{ color: "#4caf50" }}></i>
          <div className="project-info-content">
            <small>Start Date</small>
            <span>{moment(proposed_start_date).format("MMM DD, YYYY")}</span>
          </div>
        </div>
        <div className="project-info-item">
          <i className="ri-calendar-event-line" style={{ color: "#ff9800" }}></i>
          <div className="project-info-content">
            <small>End Date</small>
            <span>{moment(proposed_end_date).format("MMM DD, YYYY")}</span>
          </div>
        </div>
        <div className="project-info-item">
          <i className="ri-money-dollar-circle-line" style={{ color: "#2196f3" }}></i>
          <div className="project-info-content">
            <small>Budget</small>
            <span>₦{(total_proposed_amount || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="project-card-actions">
        <button
          className="project-action-btn project-action-primary"
          onClick={() => handleAction(id, "manage")}
        >
          <i className="ri-settings-3-line"></i>
          <span>Manage</span>
        </button>
        <button
          className="project-action-btn project-action-secondary"
          onClick={() => handleAction(id, "memo")}
        >
          <i className="ri-article-line"></i>
        </button>
        <button
          className="project-action-btn project-action-secondary"
          onClick={() => handleAction(id, "tb")}
        >
          <i className="ri-ai-generate"></i>
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
