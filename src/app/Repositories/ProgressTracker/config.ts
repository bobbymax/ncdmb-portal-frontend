import { ConfigProp } from "../BaseRepository";
import { ProgressTrackerResponseData } from "./data";

export const progressTrackerConfig: ConfigProp<ProgressTrackerResponseData> = {
  fillables: ["workflow_id", "stages"],
  associatedResources: [
    { name: "workflows", url: "workflows" },
    { name: "stages", url: "workflowStages" },
    { name: "documentTypes", url: "documentTypes" },
    { name: "documentActions", url: "documentActions" },
    { name: "mailingLists", url: "mailingLists" },
  ],
  state: {
    id: 0,
    workflow_id: 0,
    workflow_stage_id: 0,
    document_type_id: 0,
    fallback_to_stage_id: 0,
    return_to_stage_id: 0,
    order: 0,
    stage: null,
    trackerActions: [],
    trackerRecipients: [],
    stages: [],
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
