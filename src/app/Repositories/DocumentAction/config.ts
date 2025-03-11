import { ConfigProp } from "../BaseRepository";
import { DocumentActionResponseData } from "./data";

export const documentActionConfig: ConfigProp<DocumentActionResponseData> = {
  fillables: [
    "carder_id",
    "name",
    "button_text",
    "description",
    "icon",
    "variant",
    "action_status",
    "state",
    "mode",
    "has_update",
    "component",
    "category",
    "draft_status",
    "resource_type",
    "is_resource",
  ],
  associatedResources: [
    {
      name: "carders",
      url: "carders",
    },
  ],
  state: {
    id: 0,
    carder_id: 0,
    name: "",
    label: "",
    button_text: "",
    draft_status: "",
    action_status: "passed",
    icon: "",
    variant: "primary",
    state: "conditional",
    mode: "store",
    description: "",
    has_update: 0,
    component: "",
    category: "comment",
    resource_type: "searchable",
    is_resource: 0,
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
