import { ConfigProp } from "../BaseRepository";
import { ThresholdResponseData } from "./data";

export const thresholdConfig: ConfigProp<ThresholdResponseData> = {
  fillables: ["name", "amount", "type"],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
    amount: "",
    type: "WO",
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
