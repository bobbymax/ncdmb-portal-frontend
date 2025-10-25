import { ConfigProp } from "../BaseRepository";
import { DocumentPanelResponseData } from "./data";

export const documentPanelConfig: ConfigProp<DocumentPanelResponseData> = {
  fillables: [
    "document_category_id",
    "name",
    "label",
    "icon",
    "component_path",
    "order",
    "document_status",
    "is_active",
    "is_editor_only",
    "is_view_only",
    "visibility_mode",
    "is_global",
    "groups",
  ],
  associatedResources: [
    { name: "documentCategories", url: "documentCategories" },
    { name: "groups", url: "groups" },
  ],
  state: {
    id: 0,
    document_category_id: 0,
    name: "",
    label: "",
    icon: "",
    component_path: "",
    order: 0,
    is_active: true,
    is_editor_only: false,
    is_view_only: false,
    visibility_mode: "both",
    is_global: false,
    document_category: null,
    document_status: "",
    groups: [],
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
