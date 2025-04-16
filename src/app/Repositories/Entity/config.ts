import { ConfigProp } from "../BaseRepository";
import { EntityResponseData } from "./data";

export const entityConfig: ConfigProp<EntityResponseData> = {
  fillables: ["acronym", "name", "status", "payment_code"],
  associatedResources: [],
  state: {
    id: 0,
    name: "",
    acronym: "",
    status: "active",
    payment_code: "",
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
