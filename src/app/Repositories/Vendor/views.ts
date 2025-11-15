import { ViewsProps } from "../BaseRepository";

export const vendorViews: ViewsProps[] = [
  {
    title: "List of Vendors",
    server_url: "vendors",
    component: "Vendors",
    frontend_path: "/vendors/lists",
    type: "index",
    tag: "Add Vendor",
    mode: "list",
  },
  {
    title: "Create Vendor",
    server_url: "vendors",
    component: "Vendor",
    frontend_path: "/vendors/lists/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Vendor",
    index_path: "/vendors/lists",
  },
  {
    title: "Manage Vendor",
    server_url: "vendors",
    component: "Vendor",
    frontend_path: "/vendors/lists/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/vendors/lists",
  },
];
