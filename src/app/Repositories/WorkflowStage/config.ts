import { ConfigProp } from "../BaseRepository";
import { WorkflowStageResponseData } from "./data";

export const workflowStageConfig: ConfigProp<WorkflowStageResponseData> = {
  fillables: [
    "department_id",
    "group_id",
    "workflow_id",
    "name",
    "order",
    "selectedActions",
    "selectedDocumentsRequired",
    "recipients",
  ],
  associatedResources: [
    { name: "departments", url: "departments" },
    { name: "groups", url: "groups" },
    { name: "workflows", url: "workflows" },
    { name: "documentActions", url: "documentActions" },
    { name: "documentRequirements", url: "documentRequirements" },
  ],
  state: {
    id: 0,
    name: "",
    order: 0,
    workflow_id: 0,
    group_id: 0,
    department_id: 0,
    selectedActions: [],
    actions: [],
    documentsRequired: [],
    selectedDocumentsRequired: [],
    recipients: [],
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
