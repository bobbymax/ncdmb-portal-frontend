import { ConfigProp } from "../BaseRepository";
import { BudgetCodeResponseData } from "./data";

export const budgetCodeConfig: ConfigProp<BudgetCodeResponseData> = {
  fillables: ["code"],
  associatedResources: [],
  state: {
    id: 0,
    code: "",
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
