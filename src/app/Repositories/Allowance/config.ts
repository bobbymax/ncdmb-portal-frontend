import { ConfigProp } from "../BaseRepository";
import { AllowanceResponseData } from "./data";

export const allowanceConfig: ConfigProp<AllowanceResponseData> = {
  fillables: [
    "name",
    "parent_id",
    "departure_city_id",
    "destination_city_id",
    "days_required",
    "is_active",
    "description",
    "category",
    "selectedRemunerations",
    "component",
  ],
  associatedResources: [
    { name: "allowances", url: "allowances" },
    { name: "gradeLevels", url: "gradeLevels" },
    { name: "cities", url: "cities" },
  ],
  state: {
    id: 0,
    name: "",
    parent_id: 0,
    departure_city_id: 0,
    destination_city_id: 0,
    days_required: 0,
    is_active: 0,
    description: "",
    category: "parent",
    component: "flight-non-resident",
    remunerations: [],
    selectedRemunerations: [],
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
