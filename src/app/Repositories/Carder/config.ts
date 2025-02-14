import { ConfigProp } from "../BaseRepository";
import { CarderResponseData } from "./data";

export const carderConfig: ConfigProp<CarderResponseData> = {
  fillables: ["name"],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
    label: "",
    grade_levels: [],
    actions: [],
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
