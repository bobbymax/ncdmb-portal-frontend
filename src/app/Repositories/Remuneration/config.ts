import { ConfigProp } from "../BaseRepository";
import { RemunerationResponseData } from "./data";

export const remunerationConfig: ConfigProp<RemunerationResponseData> = {
  fillables: [
    "allowance_id",
    "grade_level_id",
    "amount",
    "is_active",
    "start_date",
    "expiration_date",
  ],
  associatedResources: [
    { name: "allowances", url: "allowances" },
    { name: "gradeLevels", url: "gradeLevels" },
  ],
  state: {
    id: 0,
    allowance_id: 0,
    grade_level_id: 0,
    amount: 0,
    is_active: 0,
    start_date: "",
    expiration_date: "",
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
