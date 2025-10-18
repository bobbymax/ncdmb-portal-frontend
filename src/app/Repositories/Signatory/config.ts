import { ConfigProp } from "../BaseRepository";
import { SignatoryResponseData } from "./data";

export const signatoryConfig: ConfigProp<SignatoryResponseData> = {
  fillables: [
    "page_id",
    "group_id",
    "department_id",
    "user_id",
    "flow_type",
    "type",
    "compound",
    "document_category_id",
    "order",
    "should_sign",
    "identifier",
    "workflow_stage_id",
    "carder_id",
    "actions",
  ],
  associatedResources: [
    { name: "groups", url: "groups" },
    { name: "departments", url: "departments" },
    { name: "pages", url: "pages" },
    { name: "documentCategories", url: "documentCategories" },
  ],
  state: {
    id: 0,
    identifier: "",
    page_id: 0,
    group_id: 0,
    department_id: 0,
    workflow_stage_id: 0,
    user_id: 0,
    flow_type: "from",
    type: "owner",
    compound: "",
    document_category_id: 0,
    order: 0,
    should_sign: false,
    carder_id: 0,
    actions: [],
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
