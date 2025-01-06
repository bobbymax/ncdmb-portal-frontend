import { ConfigProp } from "../BaseRepository";
import { ProgressTrackerResponseData } from "./data";

export const progressTrackerConfig: ConfigProp<ProgressTrackerResponseData> = {
  fillables: [
    "date_completed",
    "is_closed",
    "order",
    "status",
    "workflow_id",
    "workflow_stage_id",
  ],
  associatedResources: [
    { name: "workflows", url: "workflows" },
    { name: "stages", url: "workflowStages" },
  ],
  state: {
    id: 0,
    workflow_id: 0,
    workflow_stage_id: 0,
    order: 0,
    date_completed: "",
    status: "pending",
    is_closed: 0,
  },
  actions: [
    {
      label: "manage",
      icon: "ri-settings-3-line",
      variant: "success",
      conditions: [],
      operator: "and",
      display: "Manage",
    },
  ],
};
