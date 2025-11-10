import { ViewsProps } from "../BaseRepository";

export const inventoryAdjustmentViews: ViewsProps[] = [
  {
    title: "Inventory Adjustments",
    server_url: "inventory-adjustments",
    component: "InventoryAdjustments",
    frontend_path: "/inventory/adjustments",
    type: "card",
    mode: "list",
    tag: "Record Adjustment",
  },
  {
    title: "Record Adjustment",
    server_url: "inventory-adjustments",
    component: "InventoryAdjustment",
    frontend_path: "/inventory/adjustments/create",
    type: "form",
    mode: "store",
    action: "Save Adjustment",
    index_path: "/inventory/adjustments",
  },
  {
    title: "Manage Adjustment",
    server_url: "inventory-adjustments",
    component: "InventoryAdjustment",
    frontend_path: "/inventory/adjustments/:id/manage",
    type: "form",
    mode: "update",
    action: "Update Adjustment",
    index_path: "/inventory/adjustments",
  },
];
