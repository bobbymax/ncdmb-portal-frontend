import { ConfigProp } from "../BaseRepository";
import { GroupResponseData } from "./data";

export const groupConfig: ConfigProp<GroupResponseData> = {
  fillables: ["name", "rank", "scope"],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
    label: "",
    rank: 0,
    scope: "department",
    users: [],
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
