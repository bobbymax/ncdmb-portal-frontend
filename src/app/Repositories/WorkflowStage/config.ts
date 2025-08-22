import { ConfigProp } from "../BaseRepository";
import { WorkflowStageResponseData } from "./data";

export const workflowStageConfig: ConfigProp<WorkflowStageResponseData> = {
  fillables: [
    "department_id",
    "groups",
    "name",
    "workflow_stage_category_id",
    "fallback_stage_id",
    "recipients",
    "can_appeal",
    "append_signature",
    "category",
    "actions",
    "isDisplayed",
    "flow",
    "document_actions",
  ],
  associatedResources: [
    { name: "departments", url: "departments" },
    { name: "groups", url: "groups" },
    { name: "recipients", url: "mailingLists" },
    { name: "actions", url: "documentActions" },
    { name: "stageCategories", url: "workflowStageCategories" },
    { name: "stages", url: "workflowStages" },
  ],

  state: {
    id: 0,
    name: "",
    workflow_stage_category_id: 0,
    isDisplayed: 1,
    flow: "process",
    fallback_stage_id: 0,
    department_id: 0,
    category: "system",
    stage_category: null,
    groups: [],
    recipients: [],
    actions: [],
    can_appeal: 0,
    append_signature: 0,
    document_actions: [],
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
