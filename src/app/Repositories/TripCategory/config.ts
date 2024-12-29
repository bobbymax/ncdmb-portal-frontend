import { ConfigProp } from "../BaseRepository";
import { TripCategoryResponseData } from "./data";

export const tripCategoryConfig: ConfigProp<TripCategoryResponseData> = {
  fillables: [
    "name",
    "description",
    "type",
    "accommodation_type",
    "selectedAllowances",
  ],
  associatedResources: [{ name: "allowances", url: "allowances" }],
  state: {
    id: 0,
    name: "",
    label: "",
    description: "",
    type: "flight",
    accommodation_type: "non-residence",
    allowances: [],
    selectedAllowances: [],
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
