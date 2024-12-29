import { ConfigProp } from "../BaseRepository";
import { CityResponseData } from "./data";

export const cityConfig: ConfigProp<CityResponseData> = {
  fillables: ["allowance_id", "has_airport", "is_capital", "name"],
  associatedResources: [{ name: "allowances", url: "allowances" }],
  state: {
    id: 0,
    allowance_id: 0,
    is_capital: 0,
    has_airport: 0,
    name: "",
  },
  actions: [
    {
      label: "manage",
      icon: "ri-settings-3-line",
      variant: "dark",
      conditions: [],
      operator: "and",
      display: "Manage",
    },
  ],
};
