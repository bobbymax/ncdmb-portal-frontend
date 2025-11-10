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
    <div
      className={`tracker__timeline-item ${isActive ? "is-active" : ""} ${
        isLast ? "is-last" : ""
      }`}
    >
      <div className="tracker__timeline-marker">
        <span className="tracker__timeline-dot">
          <i className="ri-flag-2-line" />
        </span>
        {!isLast && <span className="tracker__timeline-connector" />}
      </div>
      <div className="tracker__timeline-body">
        <span className="tracker__timeline-timestamp">{timestamp}</span>
        <h4 className="tracker__timeline-title">{title}</h4>
        {subtitle && <p className="tracker__timeline-subtitle">{subtitle}</p>}
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

  const iconMap: Record<typeof stageType, string> = {
    from: "ri-mail-send-line",
    through: "ri-route-line",
    to: "ri-checkbox-circle-line",
  };

  const stageTitleMap: Record<typeof stageType, string> = {
    from: "Document Initiated",
    through: "Document Processed",
    to: "Document Finalized",
  };

  const signatoryLabelMap: Record<string, string> = {
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
        initials,
        user,
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
  const stageIcon = iconMap[stageType];
  const stageLabel = stageTitleMap[stageType] || stageType;
  const signatoryLabel =
    signatoryLabelMap[stage.signatory_type] || stage.signatory_type;

  return (
    <div
      className={`tracker__timeline-item tracker__timeline-item--signature ${
        isActive ? "is-active" : ""
      } ${isLast ? "is-last" : ""}`}
    >
      <div className="tracker__timeline-marker">
        <span className="tracker__timeline-dot">
          <i className={stageIcon} />
        </span>
        {!isLast && <span className="tracker__timeline-connector" />}
      </div>
      <div className="tracker__timeline-body">
        <div className="tracker__timeline-header">
          <span className="tracker__timeline-timestamp">{timestamp}</span>
          <span className="tracker__tag tracker__tag--neutral">
            {signatoryLabel}
          </span>
        </div>
        <h4 className="tracker__timeline-title">{stageLabel}</h4>

        <div className="tracker__user">
          <span className="tracker__user-avatar">{userInfo.initials}</span>
          <div className="tracker__user-meta">
            <span className="tracker__user-name">{userInfo.name}</span>
            <span className="tracker__user-role">
              {stage.should_be_signed === "yes"
                ? "Signature required"
                : "Acknowledgement"}
            </span>
          </div>
        </div>

        {actionSummary && (
          <div className="tracker__timeline-footer">{actionSummary}</div>
        )}
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
    const matchingDraft = state.existingDocument?.drafts?.find(
      (draft) => draft.progress_tracker_id === process.id
    );

    if (!matchingDraft || !matchingDraft.operator_id) {
      return {
        name: "Pending Assignment",
        initials: "?",
        user: null,
        isPending: true,
      };
    }

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
        initials,
        user,
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
    <div
      className={`tracker__timeline-item tracker__timeline-item--process ${
        isActive ? "is-active" : ""
      } ${isLast ? "is-last" : ""}`}
    >
      <div className="tracker__timeline-marker">
        <span className="tracker__timeline-dot">
          <i className="ri-flow-chart" />
        </span>
        {!isLast && <span className="tracker__timeline-connector" />}
      </div>
      <div className="tracker__timeline-body">
        <div className="tracker__timeline-header">
          <span className="tracker__timeline-timestamp">{timestamp}</span>
          <span className="tracker__tag">
            {process.department?.abv || "Dept"} •{" "}
            {process.group?.name || "Group"}
          </span>
        </div>
        <h4 className="tracker__timeline-title">{processName}</h4>
        <p className="tracker__timeline-subtitle">
          {processIdentifier.toUpperCase()}
          {isActive && (
            <span className="tracker__tag tracker__tag--active">Now</span>
          )}
        </p>

        <div className="tracker__user">
          <span
            className={`tracker__user-avatar ${
              userInfo.isPending ? "is-pending" : ""
            }`}
          >
            {userInfo.initials}
          </span>
          <div className="tracker__user-meta">
            <span className="tracker__user-name">{userInfo.name}</span>
            <span className="tracker__user-role">
              {userInfo.isPending ? "Awaiting assignment" : "Last operator"}
            </span>
          </div>
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
      <div className="tracker__empty">
        <div className="tracker__empty-icon">
          <i className="ri-road-map-line" />
        </div>
        <h4>Tracking information not available</h4>
        <p>
          Once activity is logged on this document, the full timeline appears
          here.
        </p>
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
    <div className="tracker__layout">
      <section className="tracker__panel tracker__panel--header">
        <div className="tracker__panel-icon">
          <i className="ri-file-text-line" />
        </div>
        <div className="tracker__panel-body">
          <h2 className="tracker__panel-title">{existingDocument.title}</h2>
          <div className="tracker__panel-meta">
            <span className="tracker__tag tracker__tag--id">
              <i className="ri-hashtag" />
              {existingDocument.ref}
            </span>
            <span
              className={`tracker__status tracker__status--${existingDocument.status}`}
            >
              {existingDocument.status}
            </span>
            {existingDocument.is_completed && (
              <span className="tracker__status tracker__status--completed">
                <i className="ri-checkbox-circle-fill" />
                Completed
              </span>
            )}
          </div>
        </div>
        <div className="tracker__panel-stats">
          <div className="tracker__stat-card">
            <span className="tracker__stat-icon tracker__stat-icon--created">
              <i className="ri-calendar-event-line" />
            </span>
            <div className="tracker__stat-body">
              <span className="tracker__stat-label">Created</span>
              <span className="tracker__stat-value">
                {existingDocument.created_at
                  ? new Date(existingDocument.created_at).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )
                  : "N/A"}
              </span>
            </div>
          </div>
          <div className="tracker__stat-card">
            <span className="tracker__stat-icon tracker__stat-icon--updated">
              <i className="ri-time-line" />
            </span>
            <div className="tracker__stat-body">
              <span className="tracker__stat-label">Last Updated</span>
              <span className="tracker__stat-value">
                {existingDocument.updated_at
                  ? new Date(existingDocument.updated_at).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "short", day: "numeric" }
                    )
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {hasConfig && existingDocument.config && (
        <section className="tracker__panel">
          <header className="tracker__panel-header">
            <div>
              <h3 className="tracker__panel-heading">
                <i className="ri-verified-badge-line" />
                Signatory Trail
              </h3>
              <p className="tracker__panel-subheading">
                Track signatures and authorisations across this document.
              </p>
            </div>
          </header>

          <div className="tracker__timeline">
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
                isLast
              />
            )}
          </div>
        </section>
      )}

      {hasProcesses && existingDocument.processes && (
        <section className="tracker__panel">
          <header className="tracker__panel-header">
            <div>
              <h3 className="tracker__panel-heading">
                <i className="ri-route-line" />
                Workflow Progress
              </h3>
              <p className="tracker__panel-subheading">
                Overview of the departments and teams that touched this
                document.
              </p>
            </div>
          </header>

          <div className="tracker__timeline">
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
        </section>
      )}

      {(hasThreads || hasUploads) && (
        <section className="tracker__panel tracker__panel--summary">
          <header className="tracker__panel-header">
            <div>
              <h3 className="tracker__panel-heading">
                <i className="ri-team-line" />
                Collaboration Summary
              </h3>
              <p className="tracker__panel-subheading">
                Conversations and supporting files shared across the workflow.
              </p>
            </div>
          </header>

          <div className="tracker__summary-grid">
            {hasThreads && existingDocument.threads && (
              <div className="tracker__summary-card">
                <div className="tracker__summary-icon tracker__summary-icon--threads">
                  <i className="ri-chat-3-line" />
                </div>
                <div className="tracker__summary-body">
                  <span className="tracker__summary-count">
                    {existingDocument.threads.length}
                  </span>
                  <span className="tracker__summary-label">
                    Discussion Threads
                  </span>
                </div>
              </div>
            )}

            {hasUploads && existingDocument.uploads && (
              <div className="tracker__summary-card">
                <div className="tracker__summary-icon tracker__summary-icon--uploads">
                  <i className="ri-file-upload-line" />
                </div>
                <div className="tracker__summary-body">
                  <span className="tracker__summary-count">
                    {existingDocument.uploads.length}
                  </span>
                  <span className="tracker__summary-label">Uploaded Files</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default TrackerGeneratorTab;
