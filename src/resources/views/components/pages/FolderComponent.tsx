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

  const getStatusColor = () => {
    if (officers.length === 0) return "#6b7280"; // Gray for pending
    if (officers.length >= currentTracker.order) return "#10b981"; // Green for completed
    return "#f59e0b"; // Amber for in progress
  };

  const getStatusText = () => {
    if (officers.length === 0) return "Pending";
    if (officers.length >= currentTracker.order) return "Completed";
    return "In Progress";
  };

  return (
    <div className="document-card">
      {/* Header Section */}
      <div className="card-header">
        <div className="header-main">
          <div className="document-type-badge">
            <i className="ri-file-text-line"></i>
            <span>
              {toTitleCase(extractModelName(document.documentable_type ?? ""))}
            </span>
          </div>
          <div className="document-status">
            <div
              className="status-indicator"
              style={{ backgroundColor: getStatusColor() }}
            ></div>
            <span className="status-text">{getStatusText()}</span>
          </div>
        </div>
        <div className="document-ref">
          <i className="ri-hashtag"></i>
          {document.ref}
        </div>
      </div>

      {/* Content Section */}
      <div className="card-content">
        <h3 className="document-title">{except(document.title, 50)}</h3>

        <div className="document-meta">
          <div className="meta-item">
            <i className="ri-calendar-line"></i>
            <span>{moment(document.created_at).format("MMM DD, YYYY")}</span>
          </div>
          {amount && (
            <div className="meta-item">
              <i className="ri-money-dollar-circle-line"></i>
              <span>{amount}</span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Approval Progress</span>
            <span className="progress-count">
              {officers.length}/{currentTracker.order || 1}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(
                  (officers.length / (currentTracker.order || 1)) * 100,
                  100
                )}%`,
                backgroundColor: getStatusColor(),
              }}
            ></div>
          </div>
        </div>

        {/* Reviewers Section */}
        {officers.length > 0 && (
          <div className="reviewers-section">
            <div className="reviewers-header">
              <i className="ri-user-star-line"></i>
              <span>Reviewers ({officers.length})</span>
            </div>
            <div className="reviewers-list">
              {officers.slice(0, 3).map((officer) => {
                const namePaths = officer.name.trim().split(" ");
                const initials =
                  (namePaths[0]?.[0] ?? "") + (namePaths[1]?.[0] ?? "");

                return (
                  <div
                    key={officer.id}
                    className="reviewer-avatar"
                    title={officer.name}
                  >
                    {officer.avatar ? (
                      <img
                        src="https://placehold.co/32x32"
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
              {officers.length > 3 && (
                <div className="more-reviewers">+{officers.length - 3}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="card-footer">
        <Button
          label="Open Document"
          icon="ri-external-link-line"
          handleClick={() => openFolder(document)}
          variant="primary"
          size="sm"
          rounded
        />
        <div className="footer-actions">
          <button className="action-btn" title="Add to favorites">
            <i className="ri-heart-line"></i>
          </button>
          <button className="action-btn" title="Share document">
            <i className="ri-share-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderComponent;
