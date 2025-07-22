import { TimelineNode } from "../Timeline";
import moment from "moment";

export interface WorkflowTracker {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  assigned_to?: string;
  stage_name?: string;
  stage_order?: number;
  stage?: {
    name: string;
    stage_category?: {
      icon_path?: string;
    };
  };
  [key: string]: any;
}

export interface DocumentWorkflow {
  current_tracker_id?: string;
  trackers: WorkflowTracker[];
  workflow_name?: string;
  workflow_id?: string;
}

// Helper function to determine timeline status from dynamic status values
const determineTimelineStatus = (
  tracker: WorkflowTracker,
  currentOrder: number
): TimelineNode["status"] => {
  const trackerOrder = tracker.stage_order || tracker.order || 0;

  // If tracker order is less than current order, it's completed (passed)
  if (trackerOrder < currentOrder) {
    return "completed";
  }

  // If tracker order equals current order, it's the current stage
  if (trackerOrder === currentOrder) {
    return "current";
  }

  // Check for explicit completion indicators (override order-based logic)
  const isExplicitlyCompleted =
    tracker.status?.toLowerCase().includes("completed") ||
    tracker.status?.toLowerCase().includes("done") ||
    tracker.status?.toLowerCase().includes("finished") ||
    tracker.status?.toLowerCase().includes("signed") ||
    tracker.status?.toLowerCase().includes("approved") ||
    tracker.completed_at;

  if (isExplicitlyCompleted) {
    return "completed";
  }

  // Check for explicit current indicators
  const isExplicitlyCurrent =
    tracker.status?.toLowerCase().includes("current") ||
    tracker.status?.toLowerCase().includes("active") ||
    tracker.status?.toLowerCase().includes("in_progress") ||
    tracker.status?.toLowerCase().includes("processing");

  if (isExplicitlyCurrent) {
    return "current";
  }

  // If tracker order is greater than current order, it's pending
  if (trackerOrder > currentOrder) {
    return "pending";
  }

  // Default to pending for everything else
  return "pending";
};

// Helper function to get icon from stage category or fallback to status-based icons
const getTrackerIcon = (
  tracker: WorkflowTracker,
  status: TimelineNode["status"]
): string => {
  const uri = "https://portal.test";
  // First, try to get icon from stage category
  if (tracker.stage?.stage_category?.icon_path) {
    // Return a special identifier for image icons
    return `image:${uri}${tracker.stage.stage_category.icon_path}`;
  }

  // Fallback to status-based icons
  switch (status) {
    case "completed":
      return "ri-check-line";
    case "current":
      return "ri-time-line";
    case "pending":
      return "ri-circle-line";
    default:
      return "ri-circle-line";
  }
};

export const convertWorkflowToTimeline = (
  workflow: DocumentWorkflow,
  currentTrackerId?: string
): TimelineNode[] => {
  if (!workflow.trackers || workflow.trackers.length === 0) {
    return [];
  }

  // Sort trackers by order (workflow position)
  const sortedTrackers = [...workflow.trackers].sort((a, b) => {
    return (a.stage_order || a.order || 0) - (b.stage_order || b.order || 0);
  });

  // Find current tracker to determine progress
  const currentTracker = workflow.trackers.find(
    (t) => t.id === currentTrackerId
  );
  const currentOrder =
    currentTracker?.stage_order || currentTracker?.order || 0;

  return sortedTrackers.map((tracker) => {
    // Determine status based on dynamic status values and order
    const status = determineTimelineStatus(tracker, currentOrder);

    // Get appropriate icon from stage category or fallback
    const icon = getTrackerIcon(tracker, status);

    // Format timestamp
    const getTimestamp = (tracker: WorkflowTracker): string | undefined => {
      if (tracker.completed_at) {
        return moment(tracker.completed_at).format("MMM DD, YYYY HH:mm");
      }
      if (tracker.updated_at) {
        return moment(tracker.updated_at).format("MMM DD, YYYY HH:mm");
      }
      if (tracker.created_at) {
        return moment(tracker.created_at).format("MMM DD, YYYY HH:mm");
      }
      return undefined;
    };

    // Build metadata object
    const metadata: Record<string, any> = {};

    if (tracker.assigned_to) {
      metadata["Assigned To"] = tracker.assigned_to;
    }

    if (tracker.stage_name) {
      metadata["Stage"] = tracker.stage_name;
    }

    if (tracker.status) {
      metadata["Status"] = tracker.status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    return {
      id: tracker.id,
      title: tracker.name,
      description: tracker.description,
      status,
      timestamp: getTimestamp(tracker),
      icon,
      metadata,
    };
  });
};

export const getWorkflowProgress = (
  workflow: DocumentWorkflow,
  currentTrackerId?: string
): number => {
  if (!workflow.trackers || workflow.trackers.length === 0) {
    return 0;
  }

  // Find current tracker
  const currentTracker = workflow.trackers.find(
    (t) => t.id === currentTrackerId
  );
  const currentOrder =
    currentTracker?.stage_order || currentTracker?.order || 0;

  // Calculate progress based on order position
  // If current order is 3, then stages 1 and 2 are completed
  const totalStages = workflow.trackers.length;
  const completedStages = Math.max(0, currentOrder - 1); // Subtract 1 because current stage is not completed yet

  return Math.round((completedStages / totalStages) * 100);
};

export const getCurrentStage = (
  workflow: DocumentWorkflow
): WorkflowTracker | null => {
  if (!workflow.trackers || workflow.trackers.length === 0) {
    return null;
  }

  // First try to find by current_tracker_id
  if (workflow.current_tracker_id) {
    const trackerById = workflow.trackers.find(
      (tracker) => tracker.id === workflow.current_tracker_id
    );
    if (trackerById) {
      return trackerById;
    }
  }

  // If no current_tracker_id, find the tracker with the highest order
  // that has a status indicating it's active/current
  const activeTrackers = workflow.trackers.filter((tracker) => {
    const status = tracker.status?.toLowerCase();
    return (
      status?.includes("current") ||
      status?.includes("active") ||
      status?.includes("in_progress") ||
      status?.includes("processing")
    );
  });

  if (activeTrackers.length > 0) {
    // Return the tracker with the highest order among active ones
    return activeTrackers.reduce((prev, current) => {
      const prevOrder = prev.stage_order || prev.order || 0;
      const currentOrder = current.stage_order || current.order || 0;
      return currentOrder > prevOrder ? current : prev;
    });
  }

  return null;
};
