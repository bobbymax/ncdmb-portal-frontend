import { ConfigProp } from "../BaseRepository";
import { MeasurementTypeResponseData } from "./data";

export const measurementTypeConfig: ConfigProp<MeasurementTypeResponseData> = {
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
