import { ConfigProp } from "../BaseRepository";
import { GradeLevelResponseData } from "./data";

export const gradeLevelConfig: ConfigProp<GradeLevelResponseData> = {
  fillables: ["key", "name", "type", "carder_id", "rank"],
  associatedResources: [{ name: "carders", url: "carders" }],
  state: {
    id: 0,
    carder_id: 0,
    name: "",
    key: "",
    type: "board",
    carder: null,
    rank: 0,
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
