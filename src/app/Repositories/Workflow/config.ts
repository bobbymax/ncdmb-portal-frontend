import { ConfigProp } from "../BaseRepository";
import { WorkflowResponseData } from "./data";

export const workflowConfig: ConfigProp<WorkflowResponseData> = {
  fillables: ["name", "description", "document_type_id", "type"],
  associatedResources: [{ name: "documentTypes", url: "documentTypes" }],
  state: {
    id: 0,
    name: "",
    description: "",
    document_type_id: 0,
    type: "serialize",
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
