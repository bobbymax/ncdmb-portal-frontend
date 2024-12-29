import { ConfigProp } from "../BaseRepository";
import { DocumentTypeResponseData } from "./data";

export const documentTypeConfig: ConfigProp<DocumentTypeResponseData> = {
  fillables: ["name", "description"],
  associatedResources: [],
  state: {
    id: 0,
    label: "",
    name: "",
    description: "",
    categories: [],
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
