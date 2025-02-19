import { ConfigProp } from "../BaseRepository";
import { RoleResponseData } from "./data";

export const roleConfig: ConfigProp<RoleResponseData> = {
  fillables: ["name", "slots", "department_id", "access_level"],
  associatedResources: [{ name: "departments", url: "departments" }],
  state: {
    id: 0,
    name: "",
    department_id: 0,
    slots: 0,
    access_level: "basic",
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
