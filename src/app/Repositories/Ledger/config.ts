import { ConfigProp } from "../BaseRepository";
import { LedgerResponseData } from "./data";

export const ledgerConfig: ConfigProp<LedgerResponseData> = {
  fillables: ["name", "code", "description", "groups"],
  associatedResources: [{ name: "groups", url: "groups" }],
  state: {
    id: 0,
    code: "B",
    name: "",
    description: "",
    groups: [],
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
