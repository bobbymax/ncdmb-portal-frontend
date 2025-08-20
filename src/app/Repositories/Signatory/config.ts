import { ConfigProp } from "../BaseRepository";
import { SignatoryResponseData } from "./data";

export const signatoryConfig: ConfigProp<SignatoryResponseData> = {
  fillables: [
    "page_id",
    "group_id",
    "department_id",
    "type",
    "document_category_id",
    "order",
  ],
  associatedResources: [
    { name: "groups", url: "groups" },
    { name: "departments", url: "departments" },
    { name: "pages", url: "pages" },
    { name: "documentCategories", url: "documentCategories" },
  ],
  state: {
    id: 0,
    page_id: 0,
    group_id: 0,
    department_id: 0,
    type: "owner",
    document_category_id: 0,
    order: 0,
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
