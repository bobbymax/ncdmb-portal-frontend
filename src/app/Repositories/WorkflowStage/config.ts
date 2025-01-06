import { ConfigProp } from "../BaseRepository";
import { WorkflowStageResponseData } from "./data";

export const workflowStageConfig: ConfigProp<WorkflowStageResponseData> = {
  fillables: [
    "department_id",
    "group_id",
    "name",
    "selectedActions",
    "selectedDocumentsRequired",
    "recipients",
    "workflow_stage_category_id",
    "assistant_group_id",
    "supporting_documents_verified",
    "fallback_stage_id",
    "alert_recipients",
  ],
  associatedResources: [
    { name: "departments", url: "departments" },
    { name: "groups", url: "groups" },
    { name: "stageCategories", url: "workflowStageCategories" },
    { name: "documentRequirements", url: "documentRequirements" },
    { name: "workflowStages", url: "workflowStages" },
  ],

  state: {
    id: 0,
    name: "",
    workflow_stage_category_id: 0,
    alert_recipients: 0,
    assistant_group_id: 0,
    group_id: 0,
    department_id: 0,
    selectedActions: [],
    actions: [],
    documentsRequired: [],
    selectedDocumentsRequired: [],
    fallback_stage_id: 0,
    flag: "passed",
    recipients: [],
    supporting_documents_verified: false,
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
