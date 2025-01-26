import { ConfigProp } from "../BaseRepository";
import { DocumentResponseData } from "./data";

export const documentConfig: ConfigProp<DocumentResponseData> = {
  fillables: [
    "document_category_id",
    "document_type_id",
    "vendor_id",
    "title",
    "ref",
    "description",
    "is_archived",
    "workflow_id",
  ],
  associatedResources: [
    { name: "documentCategories", url: "documentCategories" },
    { name: "documentTypes", url: "documentTypes" },
    { name: "vendors", url: "vendors" },
  ],
  state: {
    id: 0,
    document_category_id: 0,
    document_type_id: 0,
    workflow_id: 0,
    vendor_id: 0,
    documentable_id: 0,
    documentable_type: "",
    title: "",
    ref: "",
    description: "",
    file_path: "",
    status: "pending",
    is_archived: 0,
    drafts: [],
    document_template: "",
    workflow: null,
    owner: null,
  },
  actions: [
    {
      label: "manage",
      icon: "ri-settings-3-line",
      variant: "dark",
      conditions: [],
      operator: "and",
      display: "Manage",
    },
  ],
};
