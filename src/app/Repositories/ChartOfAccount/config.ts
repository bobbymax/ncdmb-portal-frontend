import { ConfigProp } from "../BaseRepository";
import { ChartOfAccountResponseData } from "./data";

export const chartOfAccountConfig: ConfigProp<ChartOfAccountResponseData> = {
  fillables: [
    "account_code",
    "name",
    "type",
    "parent_id",
    "level",
    "status",
    "is_postable",
  ],
  associatedResources: [],
  state: {
    id: 0,
    account_code: "",
    name: "",
    type: "expense",
    parent_id: 0,
    level: "ledger",
    status: "O",
    is_postable: 0,
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
