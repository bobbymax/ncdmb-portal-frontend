import {
  DocumentOwnerData,
  DocumentResponseData,
} from "app/Repositories/Document/data";
import { except, formatCurrency } from "app/Support/Helpers";
import Button from "../forms/Button";
import moment from "moment";
import { extractModelName, toTitleCase } from "bootstrap/repositories";
import { useEffect, useState } from "react";
import { AuthorisingOfficerProps } from "app/Repositories/DocumentDraft/data";
import CircularProgressBar from "./CircularProgressBar";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";

interface FileCardProps {
  loader: boolean;
  document: DocumentResponseData;
  openFolder: (document: DocumentResponseData) => void;
}

const FolderComponent = ({ loader, document, openFolder }: FileCardProps) => {
  const [officers, setOfficers] = useState<AuthorisingOfficerProps[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [color, setColor] = useState<string>("#065f46");
  const [currentTracker, setCurrentTracker] =
    useState<ProgressTrackerResponseData>({} as ProgressTrackerResponseData);

  useEffect(() => {
    if (document && document.drafts && document.drafts.length > 0) {
      const approvalsMap = new Map<string | number, AuthorisingOfficerProps>();
      // const drafts = document.drafts;
      const workflow = document.workflow;

      if (!workflow) return;

      const currentTracker = workflow.trackers.find(
        (tracker) => tracker.id === document.progress_tracker_id
      );

      setCurrentTracker(currentTracker as ProgressTrackerResponseData);
      setOfficers(Array.from(approvalsMap.values()));
    }
  }, [document]);

  const getStatusInfo = () => {
    if (officers.length === 0) {
      return {
        text: "Pending",
        color: "#ffffff",
        bgColor: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
        icon: "ri-time-line",
      };
    }
    if (officers.length >= currentTracker.order) {
      return {
        text: "Completed",
        color: "#ffffff",
        bgColor: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        icon: "ri-checkbox-circle-line",
      };
    }
    return {
      text: "In Progress",
      color: "#ffffff",
      bgColor: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      icon: "ri-loader-4-line",
    };
  };

  const getPriorityInfo = () => {
    const priority = document.preferences?.priority || "medium";
    switch (priority.toLowerCase()) {
      case "high":
        return {
          color: "#ef4444",
          bgColor: "#ef4444",
        };
      case "urgent":
        return {
          color: "#dc2626",
          bgColor: "#dc2626",
        };
      case "low":
        return {
          color: "#10b981",
          bgColor: "#10b981",
        };
      default:
        return {
          color: "#f59e0b",
          bgColor: "#f59e0b",
        };
    }
  };

  const statusInfo = getStatusInfo();
  const priorityInfo = getPriorityInfo();

  return (
    <div className="folder-card-modern">
      {/* Corner Accent */}
      <div
        className="card-accent"
        style={{ backgroundColor: priorityInfo.bgColor }}
      ></div>

      {/* Floating Status Badge */}
      <div
        className="floating-status-badge"
        style={{
          background: statusInfo.bgColor,
          color: statusInfo.color,
        }}
      >
        <i className={statusInfo.icon}></i>
        <span>{statusInfo.text}</span>
      </div>

      {/* Card Header */}
      <div className="folder-card-header">
        <div className="document-type-pill">
          <i className="ri-file-text-line"></i>
          <span>
            {toTitleCase(extractModelName(document.documentable_type ?? ""))}
          </span>
        </div>
        <div className="document-ref-modern">
          <i className="ri-hashtag"></i>
          <span>{document.ref}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="folder-card-body">
        <h3 className="document-title-modern" title={document.title}>
          {except(document.title, 50)}
        </h3>

        <div className="document-meta-grid">
          <div className="meta-item-modern">
            <i className="ri-calendar-line"></i>
            <span>{moment(document.created_at).format("MMM DD, YYYY")}</span>
          </div>
          {amount && (
            <div className="meta-item-modern highlight">
              <i className="ri-money-dollar-circle-line"></i>
              <span>{amount}</span>
            </div>
          )}
          <div className="meta-item-modern">
            <i className="ri-user-line"></i>
            <span>{except(document.owner?.name || "Unknown", 20)}</span>
          </div>
        </div>

        {/* Modern Progress Bar */}
        <div className="progress-section-modern">
          <div className="progress-header-modern">
            <span className="progress-label-modern">Workflow Progress</span>
            <span className="progress-percentage">
              {Math.round(
                (officers.length / (currentTracker.order || 1)) * 100
              )}
              %
            </span>
          </div>
          <div className="progress-track-modern">
            <div
              className="progress-fill-modern"
              style={{
                width: `${Math.min(
                  (officers.length / (currentTracker.order || 1)) * 100,
                  100
                )}%`,
                background: statusInfo.bgColor,
              }}
            >
              <div className="progress-glow"></div>
            </div>
          </div>
          <div className="progress-steps-modern">
            <span>
              {officers.length} of {currentTracker.order || 1} completed
            </span>
          </div>
        </div>

        {/* Reviewers Avatars */}
        {officers.length > 0 && (
          <div className="reviewers-section-modern">
            <span className="reviewers-label">Reviewers</span>
            <div className="reviewers-avatars-modern">
              {officers.slice(0, 3).map((officer) => {
                const namePaths = officer.name.trim().split(" ");
                const initials =
                  (namePaths[0]?.[0] ?? "") + (namePaths[1]?.[0] ?? "");
                return (
                  <div
                    key={officer.id}
                    className="reviewer-avatar-modern"
                    title={officer.name}
                  >
                    {officer.avatar ? (
                      <img
                        src="https://placehold.co/32x32"
                        alt={officer.name}
                      />
                    ) : (
                      <div className="avatar-initials-modern">
                        {initials.toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}
              {officers.length > 3 && (
                <div className="more-reviewers-modern">
                  <span>+{officers.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="folder-card-footer">
        <button
          className="open-btn-modern"
          onClick={() => openFolder(document)}
        >
          <span>Open Document</span>
          <i className="ri-arrow-right-line"></i>
        </button>
        <div className="footer-actions-modern">
          <button className="action-btn-modern" title="Add to favorites">
            <i className="ri-heart-line"></i>
          </button>
          <button className="action-btn-modern" title="Share document">
            <i className="ri-share-line"></i>
          </button>
          <button className="action-btn-modern" title="More options">
            <i className="ri-more-2-line"></i>
          </button>
        </div>
      </div>

      {/* Hover Overlay Effect */}
      <div className="card-overlay-modern"></div>
    </div>
  );
};

export default FolderComponent;
