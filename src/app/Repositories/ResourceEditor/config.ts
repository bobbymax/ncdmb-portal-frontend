import { ConfigProp } from "../BaseRepository";
import { ResourceEditorResponseData } from "./data";

export const resourceEditorConfig: ConfigProp<ResourceEditorResponseData> = {
  fillables: [
    "group_id",
    "workflow_id",
    "workflow_stage_id",
    "service_name",
    "resource_column_name",
    "permission",
    "service_update",
  ],
  associatedResources: [
    { url: "apiServices", name: "services" },
    { url: "groups", name: "groups" },
    { url: "workflows", name: "workflows" },
    { url: "workflowStages", name: "stages" },
  ],
  state: {
    id: 0,
    group_id: 0,
    workflow_id: 0,
    workflow_stage_id: 0,
    service_name: "",
    resource_column_name: "",
    service_update: "d",
    permission: "rw",
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
