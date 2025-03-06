import { ConfigProp } from "../BaseRepository";
import { SubBudgetHeadResponseData } from "./data";

export const subBudgetHeadConfig: ConfigProp<SubBudgetHeadResponseData> = {
  fillables: ["budget_head_id", "name", "type", "is_blocked", "is_logistics"],
  associatedResources: [{ name: "budgetHeads", url: "budgetHeads" }],
  state: {
    id: 0,
    budget_head_id: 0,
    name: "",
    type: "recurrent",
    is_blocked: 0,
    is_logistics: 0,
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
    {
      label: "block",
      icon: "ri-bank-line",
      variant: "dark",
      conditions: [],
      operator: "and",
      display: "Fund",
    },
    {
      label: "schedule",
      icon: "ri-bubble-chart-line",
      variant: "info",
      conditions: [],
      operator: "and",
      display: "Statement",
    },
  ],
};
