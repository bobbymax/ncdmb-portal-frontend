import { ConfigProp } from "../BaseRepository";
import { GradeLevelResponseData } from "./data";

export const gradeLevelConfig: ConfigProp<GradeLevelResponseData> = {
  fillables: ["key", "name", "type"],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
    key: "",
    type: "board",
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
