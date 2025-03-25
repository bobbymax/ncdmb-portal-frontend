import { ConfigProp } from "../BaseRepository";
import { SignatoryResponseData } from "./data";

export const signatoryConfig: ConfigProp<SignatoryResponseData> = {
  fillables: ["page_id", "group_id", "department_id", "type", "order"],
  associatedResources: [
    { name: "groups", url: "groups" },
    { name: "departments", url: "departments" },
    { name: "pages", url: "pages" },
  ],
  state: {
    id: 0,
    page_id: 0,
    group_id: 0,
    department_id: 0,
    type: "owner",
    order: 0,
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
