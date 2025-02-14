import { ConfigProp } from "../BaseRepository";
import { DocumentTypeResponseData } from "./data";

export const documentTypeConfig: ConfigProp<DocumentTypeResponseData> = {
  fillables: ["name", "description", "file_template_id"],
  associatedResources: [{ name: "templates", url: "fileTemplates" }],
  state: {
    id: 0,
    label: "",
    name: "",
    description: "",
    categories: [],
    file_template_id: 0,
    template: null,
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
