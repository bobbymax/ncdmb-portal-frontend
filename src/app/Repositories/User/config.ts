import { ConfigProp } from "../BaseRepository";
import { UserResponseData } from "./data";

export const userConfig: ConfigProp<UserResponseData> = {
  fillables: ["name", "email", "staff_no", "roles", "default_page_id"],
  associatedResources: [{ name: "roles", url: "roles" }],
  state: {
    id: 0,
    name: "",
    email: "",
    staff_no: "",
    roles: [],
    default_page_id: 0,
    pages: [],
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
