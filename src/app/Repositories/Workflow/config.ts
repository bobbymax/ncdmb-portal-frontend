import { ConfigProp } from "../BaseRepository";
import { WorkflowResponseData } from "./data";

export const workflowConfig: ConfigProp<WorkflowResponseData> = {
  fillables: ["name", "description"],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
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
