import React from "react";
import Timeline, { TimelineNode } from "./Timeline";
import {
  DocumentWorkflow,
  WorkflowTracker,
  convertWorkflowToTimeline,
  getWorkflowProgress,
  getCurrentStage,
} from "./Timeline/utils";

interface WorkflowTimelineProps {
  workflow: DocumentWorkflow;
  currentTrackerId?: string;
  className?: string;
  showProgress?: boolean;
  showTimestamps?: boolean;
  showIcons?: boolean;
  compact?: boolean;
  onTrackerClick?: (tracker: WorkflowTracker) => void;
}

const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  workflow,
  currentTrackerId,
  className = "",
  showProgress = true,
  showTimestamps = true,
  showIcons = true,
  compact = false,
  onTrackerClick,
}) => {
  const timelineNodes = convertWorkflowToTimeline(workflow, currentTrackerId);
  const progress = getWorkflowProgress(workflow, currentTrackerId);
  const currentStage = getCurrentStage(workflow);

  const handleNodeClick = (node: TimelineNode) => {
    if (onTrackerClick) {
      const tracker = workflow.trackers.find((t) => t.id === node.id);
      if (tracker) {
        onTrackerClick(tracker);
      }
    }
  };

  return (
    <div className={`workflow-timeline ${className}`}>
      {/* Progress Header */}
      {showProgress && (
        <div className="workflow-timeline__header">
          <div className="workflow-timeline__progress-info">
            <h4 className="workflow-timeline__title">
              {workflow.workflow_name || "Document Workflow"}
            </h4>
            <div className="workflow-timeline__progress-bar">
              <div
                className="workflow-timeline__progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="workflow-timeline__progress-text">
              <span className="workflow-timeline__progress-percentage">
                {progress}% Complete
              </span>
              {currentStage && (
                <span className="workflow-timeline__current-stage">
                  Current: {currentStage.name}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="workflow-timeline__content">
        {timelineNodes.length > 0 ? (
          <Timeline
            nodes={timelineNodes}
            showTimestamps={showTimestamps}
            showIcons={showIcons}
            compact={compact}
            className={onTrackerClick ? "workflow-timeline__interactive" : ""}
          />
        ) : (
          <div className="workflow-timeline__empty">
            <i className="ri-inbox-line" />
            <p>No workflow stages found</p>
          </div>
        )}
      </div>

      {/* Interactive Click Handlers */}
      {onTrackerClick && (
        <div className="workflow-timeline__click-overlay">
          {timelineNodes.map((node) => (
            <div
              key={node.id}
              className="workflow-timeline__click-area"
              onClick={() => handleNodeClick(node)}
              title={`Click to view ${node.title} details`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowTimeline;
