import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import WorkflowRepository from "app/Repositories/Workflow/WorkflowRepository";
import { CardPageComponentProps } from "bootstrap";
import React, { useMemo } from "react";
import arrow from "../../assets/images/right-arrow.png";
import Button from "../components/forms/Button";
import { useNavigate } from "react-router-dom";

const ProgressTrackers: React.FC<
  CardPageComponentProps<WorkflowResponseData, WorkflowRepository>
> = ({ collection }) => {
  const navigate = useNavigate();

  const endpoint = useMemo(() => "https://portal.test", []);

  return (
    <div className="workflows-tech-grid">
      {collection.map((workflow, i) => (
        <div className="workflow-tech-card" key={i}>
          {/* Card Header */}
          <div className="workflow-header">
            <div className="workflow-title-section">
              <div className="workflow-icon">
                <i className="ri-flow-chart"></i>
              </div>
              <div className="workflow-info">
                <h3 className="workflow-name">{workflow.name}</h3>
                <p className="workflow-stats">
                  <span className="stat-item">
                    <i className="ri-node-tree"></i>
                    {workflow.trackers.length} Stages
                  </span>
                </p>
              </div>
            </div>
            <div className="workflow-status">
              <div className="status-indicator active"></div>
              <span className="status-text">Active</span>
            </div>
          </div>

          {/* Workflow Flow Visualization */}
          <div className="workflow-flow-container">
            {workflow.trackers.length > 0 ? (
              <div className="workflow-pipeline">
                {workflow.trackers.map((tracker, index) => (
                  <div key={index} className="pipeline-node">
                    <div className="node-container">
                      <div className="node-icon">
                        <img
                          src={`${endpoint}${tracker.stage?.stage_category?.icon_path}`}
                          alt={tracker.stage?.name}
                        />
                      </div>
                      <div className="node-content">
                        <span className="node-label">
                          {tracker.stage?.name}
                        </span>
                        <span className="node-order">#{index + 1}</span>
                      </div>
                    </div>
                    {index + 1 < workflow.trackers.length && (
                      <div className="flow-connector">
                        <div className="connector-line"></div>
                        <div className="connector-arrow">
                          <i className="ri-arrow-right-s-line"></i>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-workflow">
                <div className="empty-icon">
                  <i className="ri-flow-chart"></i>
                </div>
                <p className="empty-message">No stages configured</p>
                <small className="empty-subtitle">
                  Add stages to create a workflow
                </small>
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className="workflow-actions">
            <button
              type="button"
              className="action-btn primary"
              onClick={() => {
                navigate(
                  `/admin-centre/progress-trackers/${workflow.id}/manage`
                );
              }}
            >
              <i className="ri-settings-3-line"></i>
              <span>Configure</span>
            </button>
            <button
              type="button"
              className="action-btn secondary"
              onClick={() => {}}
            >
              <i className="ri-refresh-line"></i>
              <span>Reset</span>
            </button>
            <button
              type="button"
              className="action-btn tertiary"
              onClick={() => {}}
            >
              <i className="ri-eye-line"></i>
              <span>Preview</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressTrackers;
