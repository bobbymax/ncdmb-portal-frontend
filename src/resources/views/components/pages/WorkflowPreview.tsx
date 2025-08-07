import React from "react";
import { WorkflowResponseData } from "@/app/Repositories/Workflow/data";
import { ProgressTrackerResponseData } from "@/app/Repositories/ProgressTracker/data";

interface WorkflowPreviewProps {
  workflow: WorkflowResponseData | null;
  trackers: ProgressTrackerResponseData[];
  isValid: boolean;
  errors: string[];
  isLoading?: boolean;
}

const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({
  workflow,
  trackers,
  isValid,
  errors,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="workflow__preview__container">
        <div className="workflow__preview__header">
          <h5>Workflow Preview</h5>
          <div className="workflow__preview__loading">
            <i className="ri-loader-4-line"></i>
            <span>Generating workflow...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workflow__preview__container">
      <div className="workflow__preview__header">
        <h5>Workflow Preview</h5>
        <div
          className={`workflow__preview__status ${
            isValid ? "valid" : "invalid"
          }`}
        >
          <i
            className={isValid ? "ri-check-line" : "ri-error-warning-line"}
          ></i>
          <span>{isValid ? "Valid Workflow" : "Invalid Configuration"}</span>
        </div>
      </div>

      {!isValid && errors.length > 0 && (
        <div className="workflow__preview__errors">
          <h5>Configuration Errors:</h5>
          <ul>
            {errors.map((error, index) => (
              <li key={index} className="error__item">
                <i className="ri-error-warning-line"></i>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {workflow && (
        <div className="workflow__preview__content">
          <div className="workflow__info">
            <h5>Workflow Details</h5>
            <div className="workflow__info__item">
              <strong>Name:</strong> {workflow.name}
            </div>
            <div className="workflow__info__item">
              <strong>Type:</strong> {workflow.type}
            </div>
            <div className="workflow__info__item">
              <strong>Description:</strong> {workflow.description}
            </div>
          </div>

          <div className="workflow__trackers">
            <h5>Process Flow ({trackers.length} stages)</h5>
            <div className="trackers__list">
              {trackers.map((tracker, index) => (
                <div key={tracker.identifier} className="tracker__item">
                  <div className="tracker__order">
                    <span className="tracker__number">{tracker.order}</span>
                  </div>
                  <div className="tracker__details">
                    <div className="tracker__identifier">
                      <strong>ID:</strong> {tracker.identifier}
                    </div>
                    <div className="tracker__stage">
                      <strong>Stage ID:</strong> {tracker.workflow_stage_id}
                    </div>
                    <div className="tracker__permissions">
                      <strong>Permissions:</strong> {tracker.permission}
                    </div>
                  </div>
                  {index < trackers.length - 1 && (
                    <div className="tracker__arrow">
                      <i className="ri-arrow-down-line"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowPreview;
