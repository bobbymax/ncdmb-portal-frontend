import { ConfigProp } from "../BaseRepository";
import { AuthPageResponseData } from "./data";

export const pageConfig: ConfigProp<AuthPageResponseData> = {
  fillables: [
    "icon",
    "name",
    "parent_id",
    "path",
    "type",
    "roles",
    "workflow_id",
    "document_type_id",
    "image_path",
  ],
  associatedResources: [
    { name: "pages", url: "pages" },
    { name: "roles", url: "roles" },
    { name: "workflows", url: "workflows" },
    { name: "documentTypes", url: "documentTypes" },
  ],
  state: {
    id: 0,
    name: "",
    icon: "",
    path: "",
    label: "",
    type: "index",
    parent_id: 0,
    workflow_id: 0,
    image_path: "",
    document_type_id: 0,
    roles: [],
    is_default: false,
    is_menu: false,
    workflow: null,
    documentType: null,
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
