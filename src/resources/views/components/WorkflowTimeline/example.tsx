import React, { useState } from "react";
import WorkflowTimeline from "../WorkflowTimeline";
import { DocumentWorkflow, WorkflowTracker } from "../Timeline/utils";

// Example workflow data
const exampleWorkflow: DocumentWorkflow = {
  workflow_name: "Document Approval Workflow",
  workflow_id: "workflow-001",
  current_tracker_id: "tracker-003",
  trackers: [
    {
      id: "tracker-001",
      name: "Document Submission",
      description: "Document has been submitted for review",
      status: "completed",
      stage_name: "Submission",
      stage_order: 1,
      created_at: "2024-01-15T10:00:00Z",
      completed_at: "2024-01-15T10:30:00Z",
      assigned_to: "John Doe",
    },
    {
      id: "tracker-002",
      name: "Initial Review",
      description: "Document is under initial review by department head",
      status: "completed",
      stage_name: "Review",
      stage_order: 2,
      created_at: "2024-01-15T10:30:00Z",
      completed_at: "2024-01-16T14:20:00Z",
      assigned_to: "Jane Smith",
    },
    {
      id: "tracker-003",
      name: "Manager Approval",
      description: "Awaiting manager approval for final processing",
      status: "in_progress",
      stage_name: "Approval",
      stage_order: 3,
      created_at: "2024-01-16T14:20:00Z",
      updated_at: "2024-01-17T09:15:00Z",
      assigned_to: "Mike Johnson",
    },
    {
      id: "tracker-004",
      name: "Finance Verification",
      description: "Finance department will verify budget allocation",
      status: "pending",
      stage_name: "Verification",
      stage_order: 4,
      created_at: "2024-01-15T10:00:00Z",
      assigned_to: "Sarah Wilson",
    },
    {
      id: "tracker-005",
      name: "Final Processing",
      description: "Document will be processed and archived",
      status: "pending",
      stage_name: "Processing",
      stage_order: 5,
      created_at: "2024-01-15T10:00:00Z",
      assigned_to: "System",
    },
  ],
};

const WorkflowTimelineExample: React.FC = () => {
  const [currentTrackerId, setCurrentTrackerId] = useState<string | undefined>(
    exampleWorkflow.current_tracker_id
  );

  const handleTrackerClick = (tracker: WorkflowTracker) => {
    // You can implement navigation or modal opening here
    alert(
      `Clicked: ${tracker.name}\nStatus: ${tracker.status}\nAssigned to: ${tracker.assigned_to}`
    );
  };

  const handleAdvanceWorkflow = () => {
    const currentIndex = exampleWorkflow.trackers.findIndex(
      (t) => t.id === currentTrackerId
    );

    if (currentIndex < exampleWorkflow.trackers.length - 1) {
      const nextTracker = exampleWorkflow.trackers[currentIndex + 1];
      setCurrentTrackerId(nextTracker.id);

      // Update the workflow data (in a real app, this would be an API call)
      exampleWorkflow.current_tracker_id = nextTracker.id;
      exampleWorkflow.trackers[currentIndex].status = "completed";
      exampleWorkflow.trackers[currentIndex].completed_at =
        new Date().toISOString();
      exampleWorkflow.trackers[currentIndex + 1].status = "in_progress";
      exampleWorkflow.trackers[currentIndex + 1].updated_at =
        new Date().toISOString();
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Document Workflow Timeline Example</h2>

      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={handleAdvanceWorkflow}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "var(--color-primary)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "1rem",
          }}
        >
          Advance Workflow
        </button>
        <small style={{ color: "var(--color-primary-coresponding)" }}>
          Click to simulate workflow progression
        </small>
      </div>

      <WorkflowTimeline
        workflow={exampleWorkflow}
        currentTrackerId={currentTrackerId}
        showProgress={true}
        showTimestamps={true}
        showIcons={true}
        onTrackerClick={handleTrackerClick}
      />

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "var(--color-light)",
          borderRadius: "8px",
        }}
      >
        <h4>Features Demonstrated:</h4>
        <ul>
          <li>✅ Visual workflow progression with color-coded status</li>
          <li>✅ Progress bar showing completion percentage</li>
          <li>✅ Current stage highlighting</li>
          <li>✅ Interactive timeline nodes (click to see details)</li>
          <li>✅ Responsive design for mobile devices</li>
          <li>✅ Custom icons based on stage type</li>
          <li>✅ Timestamps and metadata display</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkflowTimelineExample;
