import { ConfigProp } from "../BaseRepository";
import { TripResponseData } from "./data";

export const tripConfig: ConfigProp<TripResponseData> = {
  fillables: [
    "airport_id",
    "departure_city_id",
    "destination_city_id",
    "departure_date",
    "return_date",
    "purpose",
    "per_diem_category_id",
    "total_amount_spent",
    "route",
    "distance",
  ],
  associatedResources: [{ name: "cities", url: "cities" }],
  state: {
    id: 0,
    claim_id: 0,
    airport_id: 0,
    departure_city_id: 0,
    destination_city_id: 0,
    per_diem_category_id: 0,
    trip_category_id: 0,
    purpose: "",
    distance: 0,
    route: "one-way",
    departure_date: "",
    return_date: "",
    total_amount_spent: 0,
    category: null,
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
