import { ViewsProps } from "../BaseRepository";

export const inventoryReturnViews: ViewsProps[] = [
  {
    title: "Inventory Returns",
    server_url: "inventory-returns",
    component: "InventoryReturns",
    frontend_path: "/inventory/returns",
    type: "card",
    mode: "list",
    tag: "Log Return",
  },
  {
    title: "Log Inventory Return",
    server_url: "inventory-returns",
    component: "InventoryReturn",
    frontend_path: "/inventory/returns/create",
    type: "form",
    mode: "store",
    action: "Save Return",
    index_path: "/inventory/returns",
  },
  {
    title: "Manage Inventory Return",
    server_url: "inventory-returns",
    component: "InventoryReturn",
    frontend_path: "/inventory/returns/:id/manage",
    type: "form",
    mode: "update",
    action: "Update Return",
    index_path: "/inventory/returns",
  },
];
