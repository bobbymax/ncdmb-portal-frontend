import { ConfigProp } from "../BaseRepository";
import { InventoryReturnResponseData } from "./data";

export const inventoryReturnConfig: ConfigProp<InventoryReturnResponseData> = {
  fillables: [
    "inventory_issue_id",
    "store_supply_id",
    "location_id",
    "type",
    "returned_at",
    "reason",
    "product_id",
    "product_measurement_id",
    "quantity",
    "unit_cost",
  ],
  associatedResources: [
    { name: "issues", url: "inventory-issues" },
    { name: "supplies", url: "store-supplies" },
    { name: "locations", url: "inventory-locations" },
    { name: "products", url: "products" },
  ],
  state: {
    id: 0,
    inventory_issue_id: null,
    store_supply_id: null,
    location_id: 0,
    type: "internal",
    returned_at: new Date().toISOString(),
    reason: "",
    product_id: 0,
    product_measurement_id: null,
    quantity: 0,
    unit_cost: 0,
  },
  actions: [
    {
      label: "manage",
      icon: "ri-settings-3-line",
      variant: "info",
      conditions: [],
      operator: "and",
      display: "Manage",
    },
  ],
};
