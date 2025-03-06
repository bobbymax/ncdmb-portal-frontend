import { ConfigProp } from "../BaseRepository";
import { BudgetHeadResponseData } from "./data";

export const budgetHeadConfig: ConfigProp<BudgetHeadResponseData> = {
  fillables: ["name", "code", "is_blocked"],
  associatedResources: [],
  state: {
    id: 0,
    code: "",
    name: "",
    is_blocked: 0,
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
