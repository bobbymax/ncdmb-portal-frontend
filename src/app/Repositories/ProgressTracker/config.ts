import { ConfigProp } from "../BaseRepository";
import { ProgressTrackerResponseData } from "./data";

export const progressTrackerConfig: ConfigProp<ProgressTrackerResponseData> = {
  fillables: ["workflow_id", "stages"],
  associatedResources: [
    { name: "workflows", url: "workflows" },
    { name: "stages", url: "workflowStages" },
    { name: "documentTypes", url: "documentTypes" },
    { name: "carders", url: "carders" },
    { name: "departments", url: "departments" },
    { name: "signatories", url: "signatories" },
  ],
  state: {
    id: 0,
    workflow_id: 0,
    workflow_stage_id: 0,
    document_type_id: 0,
    group_id: 0,
    department_id: 0,
    carder_id: 0,
    signatory_id: 0,
    order: 0,
    stage: null,
    document_type: null,
    carder: null,
    group: null,
    stages: [],
    actions: [],
    recipients: [],
    loadedActions: [],
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
