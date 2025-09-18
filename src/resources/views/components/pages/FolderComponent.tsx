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
      const drafts = document.drafts;
      const workflow = document.workflow;

      if (!workflow) return;

      const currentTracker = workflow.trackers.find(
        (tracker) => tracker.id === document.progress_tracker_id
      );

      setCurrentTracker(currentTracker as ProgressTrackerResponseData);

      drafts.forEach((draft) => {
        const { history = [] } = draft;

        const latestAmount =
          history.length > 0
            ? history.reduce((max, item) =>
                (item?.version_number ?? 0) > (max?.version_number ?? 0)
                  ? item
                  : max
              ).amount
            : document.amount;

        setAmount(formatCurrency(Number(latestAmount)));

        history.forEach((action) => {
          const staffId = action.authorising_officer?.id;
          const staff = action.authorising_officer;

          if (staffId && staff && !approvalsMap.has(staffId)) {
            approvalsMap.set(
              staffId,
              action?.authorising_officer as AuthorisingOfficerProps
            );
          }
        });
      });

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
    <div className="document-card">
      {/* Priority Indicator Dot */}
      <div
        className="priority-dot"
        style={{
          backgroundColor: priorityInfo.bgColor,
        }}
      ></div>

      {/* Compact Header */}
      <div className="card-header">
        <div className="header-top">
          <div className="document-type-badge">
            <i className="ri-file-text-line"></i>
            <span>
              {toTitleCase(extractModelName(document.documentable_type ?? ""))}
            </span>
          </div>
          <div className="badges-row">
            <div
              className="status-badge"
              style={{
                background: statusInfo.bgColor,
                color: statusInfo.color,
              }}
            >
              <i className={statusInfo.icon}></i>
              <span>{statusInfo.text}</span>
            </div>
          </div>
        </div>
        <div className="document-ref">
          <i className="ri-hashtag"></i>
          <span>{document.ref}</span>
        </div>
      </div>

      {/* Compact Content */}
      <div className="card-content">
        <h3 className="document-title">{except(document.title, 45)}</h3>

        <div className="document-meta-compact">
          <div className="meta-item">
            <i className="ri-calendar-line"></i>
            <span>{moment(document.created_at).format("MMM DD")}</span>
          </div>
          {amount && (
            <div className="meta-item">
              <i className="ri-money-dollar-circle-line"></i>
              <span>{amount}</span>
            </div>
          )}
          <div className="meta-item">
            <i className="ri-user-line"></i>
            <span>{document.owner?.name || "Unknown"}</span>
          </div>
        </div>

        {/* Compact Progress */}
        <div className="progress-compact">
          <div className="progress-info">
            <span className="progress-label">Progress</span>
            <span className="progress-count">
              {officers.length}/{currentTracker.order || 1}
            </span>
          </div>
          <div className="progress-bar-compact">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(
                  (officers.length / (currentTracker.order || 1)) * 100,
                  100
                )}%`,
                backgroundColor: statusInfo.color,
              }}
            ></div>
          </div>
        </div>

        {/* Compact Reviewers */}
        {officers.length > 0 && (
          <div className="reviewers-compact">
            <div className="reviewers-avatars">
              {officers.slice(0, 4).map((officer) => {
                const namePaths = officer.name.trim().split(" ");
                const initials =
                  (namePaths[0]?.[0] ?? "") + (namePaths[1]?.[0] ?? "");
                return (
                  <div
                    key={officer.id}
                    className="reviewer-avatar-compact"
                    title={officer.name}
                  >
                    {officer.avatar ? (
                      <img
                        src="https://placehold.co/24x24"
                        alt={officer.name}
                      />
                    ) : (
                      <div className="avatar-initials">
                        {initials.toUpperCase()}
                      </div>
                    )}
                  </div>
                );
              })}
              {officers.length > 4 && (
                <div className="more-reviewers-compact">
                  +{officers.length - 4}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compact Footer */}
      <div className="card-footer">
        <Button
          label="Open"
          icon="ri-external-link-line"
          handleClick={() => openFolder(document)}
          variant="primary"
          size="xs"
          rounded
        />
        <div className="footer-actions">
          <button className="action-btn" title="Add to favorites">
            <i className="ri-heart-line"></i>
          </button>
          <button className="action-btn" title="Share document">
            <i className="ri-share-line"></i>
          </button>
          <button className="action-btn" title="More options">
            <i className="ri-more-2-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderComponent;
