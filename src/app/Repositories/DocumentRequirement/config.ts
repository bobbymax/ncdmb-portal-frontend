import { ConfigProp } from "../BaseRepository";
import { DocumentRequirementResponseData } from "./data";

export const documentRequirementConfig: ConfigProp<DocumentRequirementResponseData> =
  {
    fillables: ["name", "description", "priority"],
    associatedResources: [{ name: "workflowStages", url: "workflowStages" }],
    state: {
      id: 0,
      name: "",
      description: "",
      priority: "low",
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
