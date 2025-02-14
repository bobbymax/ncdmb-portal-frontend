import { ConfigProp } from "../BaseRepository";
import { LocationResponseData } from "./data";

export const locationConfig: ConfigProp<LocationResponseData> = {
  fillables: ["city_id", "name", "address", "is_closed"],
  associatedResources: [{ name: "cities", url: "cities" }],
  state: {
    id: 0,
    city_id: 0,
    name: "",
    address: "",
    is_closed: 0,
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
