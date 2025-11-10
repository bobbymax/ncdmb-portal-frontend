import { ViewsProps } from "../BaseRepository";

export const inventoryLocationViews: ViewsProps[] = [
  {
    title: "Inventory Locations",
    server_url: "inventory-locations",
    component: "InventoryLocations",
    frontend_path: "/inventory/areas",
    type: "card",
    tag: "Add Location",
    mode: "list",
  },
  {
    title: "Create Inventory Location",
    server_url: "inventory-locations",
    component: "InventoryLocation",
    frontend_path: "/inventory/areas/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Save Location",
    index_path: "/inventory/areas",
  },
  {
    title: "Manage Inventory Location",
    server_url: "inventory-locations",
    component: "InventoryLocation",
    frontend_path: "/inventory/areas/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Location",
    index_path: "/inventory/areas",
  },
];
