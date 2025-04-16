import { ViewsProps } from "../BaseRepository";

export const importViews: ViewsProps[] = [
  {
    title: "List of Imports",
    server_url: "imports",
    component: "Configuration",
    frontend_path: "/intelligence/imports",
    type: "card",
    tag: "Add Import",
    mode: "list",
  },
  {
    title: "Create Import",
    server_url: "imports",
    component: "Import",
    frontend_path: "/intelligence/imports/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Import",
    index_path: "/intelligence/imports",
  },
  {
    title: "Manage Import",
    server_url: "imports",
    component: "Import",
    frontend_path: "/intelligence/imports/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/intelligence/imports",
  },
];
