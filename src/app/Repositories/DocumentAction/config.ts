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
    action_status: "passed",
    icon: "",
    variant: "primary",
    state: "conditional",
    mode: "store",
    description: "",
    has_update: 0,
    component: "",
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
