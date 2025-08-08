import React, { useMemo } from "react";
import { WorkflowResponseData } from "@/app/Repositories/Workflow/data";
import { ProgressTrackerResponseData } from "@/app/Repositories/ProgressTracker/data";

interface WorkflowPreviewProps {
  workflow: WorkflowResponseData | null;
  trackers: ProgressTrackerResponseData[];
  isValid: boolean;
  errors: string[];
  isLoading?: boolean;
}

// Type guard to check if workflow has required properties
const isValidWorkflow = (
  workflow: WorkflowResponseData | null
): workflow is WorkflowResponseData => {
  return (
    workflow !== null &&
    typeof workflow === "object" &&
    "name" in workflow &&
    "type" in workflow
  );
};

// Type guard to check if tracker has required properties
const isValidTracker = (
  tracker: any
): tracker is ProgressTrackerResponseData => {
  return (
    tracker &&
    typeof tracker === "object" &&
    "identifier" in tracker &&
    "order" in tracker
  );
};

const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({
  workflow,
  trackers,
  isValid,
  errors,
  isLoading = false,
}) => {
  // Validate and filter trackers
  const validTrackers = useMemo(() => {
    return trackers.filter(isValidTracker);
  }, [trackers]);

  // Memoize the sorted trackers to prevent unnecessary re-renders
  const sortedTrackers = useMemo(() => {
    return [...validTrackers].sort((a, b) => a.order - b.order);
  }, [validTrackers]);

  // Memoize the error count
  const errorCount = useMemo(() => errors.length, [errors]);

  // Helper functions for flowchart display
  const getStageName = (tracker: ProgressTrackerResponseData): string => {
    // Extract stage name from identifier or use a default
    if (tracker.identifier) {
      const parts = tracker.identifier.split("_");
      if (parts.length >= 3) {
        const stageType = parts[2]; // from, through, to
        return stageType.charAt(0).toUpperCase() + stageType.slice(1);
      }
    }
    return `Stage ${tracker.order}`;
  };

  const getStageType = (tracker: ProgressTrackerResponseData): string => {
    // Determine stage type based on order or identifier
    if (tracker.identifier) {
      const parts = tracker.identifier.split("_");
      if (parts.length >= 3) {
        const stageType = parts[2];
        switch (stageType) {
          case "from":
            return "Origin";
          case "through":
            return "Processing";
          case "to":
            return "Destination";
          default:
            return "Processing";
        }
      }
    }

    // Fallback based on order
    if (tracker.order === 1) return "Origin";
    if (tracker.order === sortedTrackers.length) return "Destination";
    return "Processing";
  };

  const getPermissionLabel = (permission: string | null): string => {
    if (permission === null) return "N/A";
    switch (permission) {
      case "read":
        return "Read";
      case "write":
        return "Write";
      case "admin":
        return "Admin";
      default:
        return permission;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="workflow__preview__container">
        <div className="workflow__preview__header">
          <h5 className="workflow__preview__title">Workflow Preview</h5>
          <div
            className="workflow__preview__loading"
            role="status"
            aria-live="polite"
          >
            <i className="ri-loader-4-line" aria-hidden="true"></i>
            <span>Generating workflow...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no workflow is available
  if (!isValidWorkflow(workflow) && !isValid && errorCount === 0) {
    return (
      <div className="workflow__preview__container">
        <div className="workflow__preview__header">
          <h5 className="workflow__preview__title">Workflow Preview</h5>
          <div className="workflow__preview__empty">
            <i className="ri-information-line" aria-hidden="true"></i>
            <span>No workflow configuration available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="workflow__preview__container"
      role="region"
      aria-label="Workflow preview"
    >
      <div className="workflow__preview__header">
        <h5 className="workflow__preview__title">Workflow Preview</h5>
        <div
          className={`workflow__preview__status ${
            isValid ? "valid" : "invalid"
          }`}
          role="status"
          aria-live="polite"
        >
          <i
            className={isValid ? "ri-check-line" : "ri-error-warning-line"}
            aria-hidden="true"
          ></i>
          <span>
            {isValid
              ? "Valid Workflow"
              : errorCount > 0
              ? `${errorCount} Configuration Error${errorCount > 1 ? "s" : ""}`
              : "Invalid Configuration"}
          </span>
        </div>
      </div>

      {!isValid && errorCount > 0 && (
        <div
          className="workflow__preview__errors"
          role="alert"
          aria-live="assertive"
        >
          <h6 className="workflow__preview__errors__title">
            Configuration Errors:
          </h6>
          <ul className="workflow__preview__errors__list" role="list">
            {errors.map((error, index) => (
              <li
                key={`error-${index}`}
                className="error__item"
                role="listitem"
              >
                <i className="ri-error-warning-line" aria-hidden="true"></i>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isValidWorkflow(workflow) && (
        <div className="workflow__preview__content">
          <div
            className="workflow__trackers"
            role="region"
            aria-label="Process flow stages"
          >
            <h6 className="workflow__trackers__title">
              Process Flow ({sortedTrackers.length} stage
              {sortedTrackers.length !== 1 ? "s" : ""})
            </h6>
            {sortedTrackers.length > 0 ? (
              <div className="workflow__flowchart">
                <div className="flowchart__container">
                  {sortedTrackers.map((tracker, index) => (
                    <div
                      key={`tracker-${tracker.identifier}-${index}`}
                      className="flowchart__item"
                    >
                      {/* Flowchart Node */}
                      <div
                        className="flowchart__node"
                        data-stage-type={getStageType(tracker).toLowerCase()}
                      >
                        <div className="flowchart__node__header">
                          <div className="flowchart__node__order">
                            <span className="flowchart__node__number">
                              {tracker.order}
                            </span>
                          </div>
                          <div className="flowchart__node__title">
                            <h6 className="flowchart__node__name">
                              {getStageName(tracker)}
                            </h6>
                            <p className="flowchart__node__type">
                              {getStageType(tracker)}
                            </p>
                          </div>
                        </div>
                        <div className="flowchart__node__content">
                          <div className="flowchart__node__details">
                            <div className="flowchart__detail__item">
                              <span className="flowchart__detail__label">
                                Stage ID:
                              </span>
                              <span className="flowchart__detail__value">
                                {tracker.workflow_stage_id || "N/A"}
                              </span>
                            </div>
                            <div className="flowchart__detail__item">
                              <span className="flowchart__detail__label">
                                Group:
                              </span>
                              <span className="flowchart__detail__value">
                                {tracker.group_id || "N/A"}
                              </span>
                            </div>
                            <div className="flowchart__detail__item">
                              <span className="flowchart__detail__label">
                                Department:
                              </span>
                              <span className="flowchart__detail__value">
                                {tracker.department_id || "N/A"}
                              </span>
                            </div>
                            <div className="flowchart__detail__item">
                              <span className="flowchart__detail__label">
                                Access:
                              </span>
                              <span className="flowchart__detail__value">
                                {getPermissionLabel(tracker.permission)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flowchart Arrow */}
                      {index < sortedTrackers.length - 1 && (
                        <div className="flowchart__arrow">
                          <div className="flowchart__arrow__line"></div>
                          <div className="flowchart__arrow__head">
                            <i className="ri-arrow-right-line"></i>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="workflow__trackers__empty">
                <i className="ri-information-line" aria-hidden="true"></i>
                <span>No workflow stages configured</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(WorkflowPreview);
