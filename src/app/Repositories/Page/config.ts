import { ConfigProp } from "../BaseRepository";
import { AuthPageResponseData } from "./data";

export const pageConfig: ConfigProp<AuthPageResponseData> = {
  fillables: ["icon", "name", "parent_id", "path", "type", "roles"],
  associatedResources: [
    { name: "pages", url: "pages" },
    { name: "roles", url: "roles" },
  ],
  state: {
    id: 0,
    name: "",
    icon: "",
    path: "",
    label: "",
    type: "index",
    parent_id: 0,
    roles: [],
    is_default: false,
    is_menu: false,
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
