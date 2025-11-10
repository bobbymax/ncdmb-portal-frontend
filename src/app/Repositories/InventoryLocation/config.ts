import { ConfigProp } from "../BaseRepository";
import { InventoryLocationResponseData } from "./data";

export const inventoryLocationConfig: ConfigProp<InventoryLocationResponseData> = {
  fillables: ["name", "code", "type", "department_id", "parent_id"],
  associatedResources: [
    { name: "departments", url: "departments" },
    { name: "locations", url: "inventory-locations" },
  ],
  state: {
    id: 0,
    name: "",
    code: "",
    type: "warehouse",
    department_id: null,
    parent_id: null,
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
