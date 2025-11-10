import { ConfigProp } from "../BaseRepository";
import { InventoryIssueResponseData } from "./data";

export const inventoryIssueConfig: ConfigProp<InventoryIssueResponseData> = {
  fillables: [
    "requisition_id",
    "issued_to",
    "from_location_id",
    "issued_at",
    "remarks",
    "items",
  ],
  associatedResources: [
    { name: "requisitions", url: "requisitions" },
    { name: "locations", url: "inventory-locations" },
    { name: "products", url: "products" },
  ],
  state: {
    id: 0,
    requisition_id: 0,
    issued_by: 0,
    issued_to: null,
    from_location_id: 0,
    issued_at: new Date().toISOString(),
    remarks: "",
    items: [],
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
