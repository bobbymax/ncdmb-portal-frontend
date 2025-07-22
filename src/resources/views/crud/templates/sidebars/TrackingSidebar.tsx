import React, { useMemo } from "react";
import { SidebarProps } from "./AnalysisSidebar";
import { DocumentResponseData } from "../../../../../app/Repositories/Document/data";
import WorkflowTimeline from "../../../components/WorkflowTimeline";
import {
  DocumentWorkflow,
  WorkflowTracker,
} from "../../../components/Timeline/utils";
import {
  extractModelName,
  toTitleCase,
} from "../../../../../bootstrap/repositories";

const TrackingSidebar: React.FC<SidebarProps<DocumentResponseData>> = ({
  tracker,
  document,
  workflow,
}) => {
  const { trackers } = useMemo(() => workflow, [workflow]);

  // Convert the workflow data to the format expected by WorkflowTimeline
  const workflowData: DocumentWorkflow = useMemo(() => {
    if (!trackers || trackers.length === 0) {
      return {
        workflow_name: "Document Workflow",
        trackers: [],
      };
    }

    return {
      workflow_name: document?.documentable_type
        ? `${toTitleCase(
            extractModelName(document.documentable_type)
          )} Workflow`
        : "Document Workflow",
      workflow_id: document?.id?.toString(),
      current_tracker_id: tracker?.id?.toString(),
      trackers: trackers.map((trackerItem: any) => ({
        id: trackerItem.id?.toString() || "",
        name:
          trackerItem.stage?.name || trackerItem.stage_name || "Unknown Stage",
        description: `Stage: ${trackerItem.stage?.name || "Unknown"}`,
        status: trackerItem.status || "pending",
        stage_name: trackerItem.stage?.name || trackerItem.stage_name,
        stage_order: trackerItem.order || 0,
        order: trackerItem.order || 0,
        created_at: trackerItem.created_at,
        updated_at: trackerItem.updated_at,
        completed_at: trackerItem.completed_at,
        assigned_to:
          trackerItem.carder?.name || trackerItem.group?.name || "Unassigned",
        stage: trackerItem.stage
          ? {
              name: trackerItem.stage.name,
              stage_category: trackerItem.stage.stage_category,
            }
          : undefined,
      })),
    };
  }, [trackers, tracker, document]);

  const handleTrackerClick = (clickedTracker: WorkflowTracker) => {
    console.log("Tracker clicked:", clickedTracker);
    // You can implement navigation or modal opening here
    // For example, show tracker details, open edit modal, etc.
  };

  return (
    <div className="tracking-sidebar">
      <div className="tracking-sidebar__header">
        <h3 className="tracking-sidebar__title">
          <i className="ri-time-line" />
          Document Tracking
        </h3>
        {document && (
          <small className="tracking-sidebar__document-info">
            {toTitleCase(extractModelName(document.documentable_type))}
          </small>
        )}
      </div>

      <div className="tracking-sidebar__content">
        <WorkflowTimeline
          workflow={workflowData}
          currentTrackerId={tracker?.id?.toString()}
          showProgress={true}
          showTimestamps={false}
          showIcons={true}
          compact={true}
          onTrackerClick={handleTrackerClick}
        />
      </div>

      {/* Additional tracking information */}
      {tracker && (
        <div className="tracking-sidebar__current-stage">
          <h4>Current Stage</h4>
          <div className="current-stage__info">
            <p>
              <strong>{tracker.stage?.name || "Current Stage"}</strong>
            </p>
            {tracker.stage?.name && (
              <p className="current-stage__description">
                Stage: {tracker.stage.name}
              </p>
            )}
            {(tracker.carder?.name || tracker.group?.name) && (
              <p className="current-stage__assignee">
                <i className="ri-user-line" />
                Assigned to: {tracker.carder?.name || tracker.group?.name}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingSidebar;
