import { ConfigProp } from "../BaseRepository";
import { ExpenseResponseData } from "./data";

export const expenseConfig: ConfigProp<ExpenseResponseData> = {
  fillables: [
    "identifier",
    "parent_id",
    "allowance_id",
    "remuneration_id",
    "start_date",
    "end_date",
    "no_of_days",
    "total_distance_covered",
    "unit_price",
    "total_amount_spent",
    "description",
    "status",
  ],
  associatedResources: [
    { name: "allowances", url: "allowances" },
    { name: "cities", url: "cities" },
  ],
  state: {
    id: 0,
    identifier: "",
    parent_id: 0,
    allowance_id: 0,
    remuneration_id: 0,
    start_date: "",
    end_date: "",
    no_of_days: 0,
    total_distance_covered: 0,
    unit_price: 0,
    total_amount_spent: 0,
    description: "",
    type: "flight-takeoff",
    status: "pending",
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
