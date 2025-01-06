import { ConfigProp } from "../BaseRepository";
import { DocumentCategoryResponseData } from "./data";

export const documentCategoryConfig: ConfigProp<DocumentCategoryResponseData> =
  {
    fillables: [
      "name",
      "description",
      "document_type_id",
      "icon",
      "workflow_id",
      "selectedRequirements",
    ],
    associatedResources: [
      { name: "documentTypes", url: "documentTypes" },
      { name: "workflows", url: "workflows" },
      { name: "documentRequirements", url: "documentRequirements" },
    ],
    state: {
      id: 0,
      document_type_id: 0,
      workflow_id: 0,
      name: "",
      label: "",
      icon: "",
      description: "",
      requirements: [],
      selectedRequirements: [],
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
