import { usePaperBoard } from "app/Context/PaperBoardContext";
import { useResourceContext } from "app/Context/ResourceContext";
import {
  DocumentCategoryResponseData,
  CategoryProgressTrackerProps,
} from "@/app/Repositories/DocumentCategory/data";
import { DocumentActionResponseData } from "@/app/Repositories/DocumentAction/data";
import { ProgressTrackerResponseData } from "@/app/Repositories/ProgressTracker/data";
import React from "react";
import "resources/assets/css/process-cards.css";

interface TrackerGeneratorTabProps {
  category: DocumentCategoryResponseData;
}

interface TimelineItemProps {
  timestamp: string;
  title: string;
  subtitle?: string;
  isActive?: boolean;
  isLast?: boolean;
}

interface SignatureTimelineItemProps {
  stage: CategoryProgressTrackerProps;
  stageType: "from" | "through" | "to";
  timestamp: string;
  isActive?: boolean;
  isLast?: boolean;
}

interface ProcessTimelineItemProps {
  process: ProgressTrackerResponseData;
  timestamp: string;
  isActive?: boolean;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  timestamp,
  title,
  subtitle,
  isActive = false,
  isLast = false,
}) => {
  return (
    <div className="timeline-item">
      <div className="timeline-marker">
        <div className={`timeline-circle ${isActive ? "active" : ""}`}></div>
        {!isLast && <div className="timeline-line"></div>}
      </div>
      <div className="timeline-content">
        <div className="timeline-timestamp">{timestamp}</div>
        <div className="timeline-title">{title}</div>
        {subtitle && <div className="timeline-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

const SignatureTimelineItem: React.FC<SignatureTimelineItemProps> = ({
  stage,
  stageType,
  timestamp,
  isActive = false,
  isLast = false,
}) => {
  const { getResourceById } = useResourceContext();

  const getSignatoryTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      owner: "Owner",
      witness: "Witness",
      approval: "Approver",
      authorised: "Authorised",
      attestation: "Attestation",
      auditor: "Auditor",
      initiator: "Initiator",
      vendor: "Vendor",
      other: "Other",
    };
    return labels[type] || type;
  };

  const getStageLabel = (type: string) => {
    switch (type) {
      case "from":
        return "Document Initiated";
      case "through":
        return "Document Processed";
      case "to":
        return "Document Finalized";
      default:
        return type;
    }
  };

  const getActionSummary = () => {
    if (!stage.actions || stage.actions.length === 0) return null;

    const completedActions = stage.actions.filter(
      (action) =>
        action.action_status === "passed" || action.action_status === "complete"
    );

    if (completedActions.length === 0) return null;

    return `${completedActions.length} action${
      completedActions.length > 1 ? "s" : ""
    } completed`;
  };

  const getUserInfo = () => {
    const user = getResourceById("users", stage.user_id);
    if (user) {
      const fullName =
        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
        user.name ||
        `User ID: ${stage.user_id}`;
      const initials = fullName
        .split(" ")
        .map((n: string) => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
      return {
        name: fullName,
        initials: initials,
        user: user,
      };
    }
    return {
      name: `User ID: ${stage.user_id}`,
      initials: "U",
      user: null,
    };
  };

  const actionSummary = getActionSummary();
  const userInfo = getUserInfo();

  return (
    <div className="timeline-item">
      <div className="timeline-marker">
        <div className={`timeline-circle ${isActive ? "active" : ""}`}></div>
        {!isLast && <div className="timeline-line"></div>}
      </div>
      <div className="timeline-content">
        <div className="timeline-timestamp">{timestamp}</div>
        <div className="timeline-title">{getStageLabel(stageType)}</div>
        <div className="timeline-user-info">
          <div className="timeline-user-avatar">{userInfo.initials}</div>
          <div className="timeline-user-name">{userInfo.name}</div>
        </div>
        <div className="timeline-user-details">
          {getSignatoryTypeLabel(stage.signatory_type)}
          {stage.should_be_signed === "yes" && " • Signature Required"}
          {actionSummary && ` • ${actionSummary}`}
        </div>
      </div>
    </div>
  );
};

const ProcessTimelineItem: React.FC<ProcessTimelineItemProps> = ({
  process,
  timestamp,
  isActive = false,
  isLast = false,
}) => {
  const { getResourceById } = useResourceContext();
  const { state } = usePaperBoard();

  const processName =
    process.stage?.name || process.process_card?.name || "Process Stage";
  const processIdentifier = process.identifier || "unknown";

  const getUserInfo = () => {
    // Find the draft that matches this process
    const matchingDraft = state.existingDocument?.drafts?.find(
      (draft) => draft.progress_tracker_id === process.id
    );

    // If no matching draft found, the process hasn't happened yet
    if (!matchingDraft || !matchingDraft.operator_id) {
      return {
        name: "Pending Assignment",
        initials: "?",
        user: null,
        isPending: true,
      };
    }

    // Get user information from the draft's operator_id
    const user = getResourceById("users", matchingDraft.operator_id);
    if (user) {
      const fullName =
        `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
        user.name ||
        `User ID: ${matchingDraft.operator_id}`;
      const initials = fullName
        .split(" ")
        .map((n: string) => n.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
      return {
        name: fullName,
        initials: initials,
        user: user,
        isPending: false,
      };
    }
    return {
      name: `User ID: ${matchingDraft.operator_id}`,
      initials: "U",
      user: null,
      isPending: false,
    };
  };

  const userInfo = getUserInfo();

  return (
    <div className="timeline-item">
      <div className="timeline-marker">
        <div className={`timeline-circle ${isActive ? "active" : ""}`}></div>
        {!isLast && <div className="timeline-line"></div>}
      </div>
      <div className="timeline-content">
        <div className="timeline-timestamp">{timestamp}</div>
        <div className="timeline-title">{processName}</div>
        <div className="timeline-user-info">
          <div
            className={`timeline-user-avatar ${
              userInfo.isPending ? "pending" : ""
            }`}
          >
            {userInfo.initials}
          </div>
          <div className="timeline-user-name">{userInfo.name}</div>
        </div>
        <div className="timeline-user-details">
          {userInfo.isPending
            ? "Awaiting Assignment"
            : `${process.department?.abv || "Unknown Dept"} • ${
                process.group?.name || "Unknown Group"
              }`}
          {isActive && " • Current Position"}
        </div>
      </div>
    </div>
  );
};

const TrackerGeneratorTab: React.FC<TrackerGeneratorTabProps> = ({
  category,
}) => {
  const { state } = usePaperBoard();
  const { existingDocument } = state;

  //   console.log("existingDocument", existingDocument);

  if (!existingDocument) {
    return (
      <div className="tracker-empty-state">
        <div className="tracker-empty-icon">
          <i className="ri-road-map-line"></i>
        </div>
        <h4>No Document Tracking Available</h4>
        <p>Document tracking information will appear here once available.</p>
      </div>
    );
  }

  const hasConfig =
    existingDocument.config &&
    (existingDocument.config.from ||
      existingDocument.config.through ||
      existingDocument.config.to);

  const hasProcesses =
    existingDocument.processes && existingDocument.processes.length > 0;

  const hasThreads =
    existingDocument.threads && existingDocument.threads.length > 0;
  const hasUploads =
    existingDocument.uploads && existingDocument.uploads.length > 0;

  // Helper function to format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get timestamps for config stages
  const getConfigTimestamps = () => {
    const timestamps: Record<string, string> = {};

    if (existingDocument.created_at) {
      timestamps.from = formatDate(existingDocument.created_at);
    }

    if (existingDocument.updated_at) {
      timestamps.through = formatDate(existingDocument.updated_at);
      timestamps.to = formatDate(existingDocument.updated_at);
    }

    return timestamps;
  };

  const configTimestamps = getConfigTimestamps();

  return (
    <div className="tracker-generator-tab">
      {/* Document Header */}
      <div className="tracker-document-header">
        <div className="tracker-document-icon">
          <i className="ri-file-text-line"></i>
        </div>
        <div className="tracker-document-info">
          <h3 className="tracker-document-title">{existingDocument.title}</h3>
          <div className="tracker-document-meta">
            <span className="tracker-document-ref">
              <i className="ri-hashtag"></i>
              {existingDocument.ref}
            </span>
            <span
              className={`tracker-document-status status-${existingDocument.status}`}
            >
              {existingDocument.status}
            </span>
            {existingDocument.is_completed && (
              <span className="tracker-document-completed">
                <i className="ri-checkbox-circle-fill"></i>
                Completed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Users that signed on this document */}
      {hasConfig && existingDocument.config && (
        <div className="timeline-section">
          <div className="timeline-section-header">
            <h3>Signatories</h3>
          </div>
          <div className="timeline-container">
            {existingDocument.config.from && (
              <SignatureTimelineItem
                stage={existingDocument.config.from}
                stageType="from"
                timestamp={configTimestamps.from || "Created"}
                isActive={
                  existingDocument.pointer ===
                  existingDocument.config.from.identifier
                }
                isLast={
                  !existingDocument.config.through &&
                  !existingDocument.config.to
                }
              />
            )}

            {existingDocument.config.through && (
              <SignatureTimelineItem
                stage={existingDocument.config.through}
                stageType="through"
                timestamp={configTimestamps.through || "Processed"}
                isActive={
                  existingDocument.pointer ===
                  existingDocument.config.through.identifier
                }
                isLast={!existingDocument.config.to}
              />
            )}

            {existingDocument.config.to && (
              <SignatureTimelineItem
                stage={existingDocument.config.to}
                stageType="to"
                timestamp={configTimestamps.to || "Finalized"}
                isActive={
                  existingDocument.pointer ===
                  existingDocument.config.to.identifier
                }
                isLast={true}
              />
            )}
          </div>
        </div>
      )}

      {/* Users that processed this document */}
      {hasProcesses && existingDocument.processes && (
        <div className="timeline-section">
          <div className="timeline-section-header">
            <h3>Processes</h3>
          </div>
          <div className="timeline-container">
            {existingDocument.processes.map((process, index) => (
              <ProcessTimelineItem
                key={process.id}
                process={process}
                timestamp={formatDate(process.created_at)}
                isActive={existingDocument.pointer === process.identifier}
                isLast={index === (existingDocument.processes?.length || 0) - 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Activity Summary */}
      {(hasThreads || hasUploads) && (
        <div className="collaboration-summary-section">
          <div className="section-header">
            <i className="ri-team-line"></i>
            <h3>Activity Summary</h3>
          </div>

          <div className="collaboration-summary-grid">
            {hasThreads && existingDocument.threads && (
              <div className="collaboration-item">
                <div className="collaboration-icon threads">
                  <i className="ri-chat-3-line"></i>
                </div>
                <div className="collaboration-details">
                  <span className="collaboration-count">
                    {existingDocument.threads.length}
                  </span>
                  <span className="collaboration-label">
                    Discussion Threads
                  </span>
                </div>
              </div>
            )}

            {hasUploads && existingDocument.uploads && (
              <div className="collaboration-item">
                <div className="collaboration-icon uploads">
                  <i className="ri-file-upload-line"></i>
                </div>
                <div className="collaboration-details">
                  <span className="collaboration-count">
                    {existingDocument.uploads.length}
                  </span>
                  <span className="collaboration-label">Uploaded Files</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline Footer */}
      <div className="tracker-timeline-footer">
        <div className="timeline-footer-item">
          <i className="ri-calendar-event-line"></i>
          <div className="timeline-footer-details">
            <span className="timeline-footer-label">Created</span>
            <span className="timeline-footer-value">
              {existingDocument.created_at
                ? new Date(existingDocument.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="timeline-footer-item">
          <i className="ri-time-line"></i>
          <div className="timeline-footer-details">
            <span className="timeline-footer-label">Last Updated</span>
            <span className="timeline-footer-value">
              {existingDocument.updated_at
                ? new Date(existingDocument.updated_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackerGeneratorTab;
