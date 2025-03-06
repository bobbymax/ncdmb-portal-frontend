import { ConfigProp } from "../BaseRepository";
import { FundResponseData } from "./data";

export const fundConfig: ConfigProp<FundResponseData> = {
  fillables: [
    "sub_budget_head_id",
    "department_id",
    "budget_code_id",
    "total_approved_amount",
    "budget_year",
    "is_exhausted",
    "is_logistics",
  ],
  associatedResources: [
    { name: "subBudgetHeads", url: "subBudgetHeads" },
    { name: "departments", url: "departments" },
    { name: "budgetCodes", url: "budgetCodes" },
  ],
  state: {
    id: 0,
    sub_budget_head_id: 0,
    department_id: 0,
    budget_code_id: 0,
    total_approved_amount: 0,
    budget_year: 0,
    is_exhausted: 0,
    is_logistics: 0,
    type: "capital",
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
