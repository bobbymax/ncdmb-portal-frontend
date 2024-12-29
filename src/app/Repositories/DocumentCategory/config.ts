import { ConfigProp } from "../BaseRepository";
import { DocumentCategoryResponseData } from "./data";

export const documentCategoryConfig: ConfigProp<DocumentCategoryResponseData> =
  {
    fillables: ["name", "description", "document_type_id", "icon"],
    associatedResources: [{ name: "documentTypes", url: "documentTypes" }],
    state: {
      id: 0,
      document_type_id: 0,
      name: "",
      label: "",
      icon: "",
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
