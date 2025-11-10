import { ConfigProp } from "../BaseRepository";
import { InventoryAdjustmentResponseData } from "./data";

export const inventoryAdjustmentConfig: ConfigProp<InventoryAdjustmentResponseData> = {
  fillables: ["location_id", "reason", "notes", "adjusted_at", "lines"],
  associatedResources: [
    { name: "locations", url: "inventory-locations" },
    { name: "products", url: "products" },
  ],
  state: {
    id: 0,
    location_id: 0,
    performed_by: 0,
    reason: "cycle_count",
    notes: "",
    adjusted_at: new Date().toISOString(),
    lines: [],
  },
  actions: [
    {
      label: "manage",
      icon: "ri-settings-3-line",
      variant: "warning",
      conditions: [],
      operator: "and",
      display: "Manage",
    },
  ],
};
