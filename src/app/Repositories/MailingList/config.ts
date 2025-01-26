import { ConfigProp } from "../BaseRepository";
import { MailingListResponseData } from "./data";

export const mailingListConfig: ConfigProp<MailingListResponseData> = {
  fillables: ["group_id", "name", "department_id"],
  associatedResources: [
    { name: "groups", url: "groups" },
    { name: "departments", url: "departments" },
  ],
  state: {
    id: 0,
    group_id: 0,
    name: "",
    department_id: 0,
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
