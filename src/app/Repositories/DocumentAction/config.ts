import { ConfigProp } from "../BaseRepository";
import { DocumentActionResponseData } from "./data";

export const documentActionConfig: ConfigProp<DocumentActionResponseData> = {
  fillables: [
    "name",
    "button_text",
    "description",
    "url",
    "frontend_path",
    "icon",
    "variant",
    "status",
  ],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
    button_text: "",
    url: "",
    frontend_path: "",
    icon: "",
    variant: "primary",
    status: "",
    description: "",
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
