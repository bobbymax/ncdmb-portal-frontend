import { ConfigProp } from "../BaseRepository";
import { DocumentRequirementResponseData } from "./data";

export const documentRequirementConfig: ConfigProp<DocumentRequirementResponseData> =
  {
    fillables: ["name"],
    associatedResources: [],
    state: {
      id: 0,
      name: "",
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
