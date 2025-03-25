import { ConfigProp } from "../BaseRepository";
import { CarderResponseData } from "./data";

export const carderConfig: ConfigProp<CarderResponseData> = {
  fillables: ["name", "groups"],
  associatedResources: [{ name: "groups", url: "groups" }],
  state: {
    id: 0,
    name: "",
    label: "",
    grade_levels: [],
    actions: [],
    groups: [],
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
