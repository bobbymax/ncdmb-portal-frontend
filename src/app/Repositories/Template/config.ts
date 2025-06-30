import { ConfigProp } from "../BaseRepository";
import { TemplateResponseData } from "./data";

export const templateConfig: ConfigProp<TemplateResponseData> = {
  fillables: [
    "document_category_id",
    "name",
    "header",
    "body",
    "footer",
    "active",
  ],
  associatedResources: [
    { name: "documentCategories", url: "documentCategories" },
  ],
  state: {
    id: 0,
    document_category_id: 0,
    name: "",
    header: "memo",
    body: [],
    footer: "",
    active: 1,
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
    {
      label: "builder",
      icon: "ri-layout-grid-line",
      variant: "dark",
      conditions: [],
      operator: "and",
      display: "Builder",
    },
  ],
};
