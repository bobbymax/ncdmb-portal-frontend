import { ConfigProp } from "../BaseRepository";
import { GroupResponseData } from "./data";

export const groupConfig: ConfigProp<GroupResponseData> = {
  fillables: ["name"],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
    label: "",
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
