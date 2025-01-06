import { ConfigProp } from "../BaseRepository";
import { DocumentActionResponseData } from "./data";

export const documentActionConfig: ConfigProp<DocumentActionResponseData> = {
  fillables: [
    "workflow_stage_category_id",
    "name",
    "button_text",
    "description",
    "process_status",
    "icon",
    "variant",
    "status",
  ],
  associatedResources: [
    { name: "stageCategories", url: "workflowStageCategories" },
  ],
  state: {
    id: 0,
    workflow_stage_category_id: 0,
    name: "",
    label: "",
    button_text: "",
    process_status: "next",
    icon: "",
    variant: "primary",
    status: "",
    description: "",
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
