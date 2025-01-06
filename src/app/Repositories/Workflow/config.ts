import { ConfigProp } from "../BaseRepository";
import { WorkflowResponseData } from "./data";

export const workflowConfig: ConfigProp<WorkflowResponseData> = {
  fillables: ["name", "description", "type"],
  associatedResources: [{ name: "documentTypes", url: "documentTypes" }],
  state: {
    id: 0,
    name: "",
    description: "",
    type: "serialize",
    trackers: [],
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
