import { ConfigProp } from "../BaseRepository";
import { WorkflowStageResponseData } from "./data";

export const workflowStageConfig: ConfigProp<WorkflowStageResponseData> = {
  fillables: [
    "department_id",
    "group_id",
    "name",
    "workflow_stage_category_id",
    "status",
    "can_appeal",
    "append_signature",
    "should_upload",
  ],
  associatedResources: [
    { name: "departments", url: "departments" },
    { name: "groups", url: "groups" },
    { name: "stageCategories", url: "workflowStageCategories" },
  ],

  state: {
    id: 0,
    name: "",
    workflow_stage_category_id: 0,
    group_id: 0,
    department_id: 0,
    status: "passed",
    stage_category: null,
    group: null,
    can_appeal: 0,
    append_signature: 0,
    should_upload: 0,
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
