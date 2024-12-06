import { ViewsProps } from "../BaseRepository";

export const roleViews: ViewsProps[] = [
  {
    title: "Roles List",
    server_url: "roles",
    component: "Roles",
    frontend_path: "/admin-centre/roles",
    type: "index",
    tag: "Add Role",
    mode: "list",
  },
  {
    title: "Create Role",
    server_url: "roles",
    component: "Role",
    frontend_path: "/admin-centre/roles/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Role",
    index_path: "/admin-centre/roles",
  },
  {
    title: "Manage Role",
    server_url: "roles",
    component: "Role",
    frontend_path: "/admin-centre/roles/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/admin-centre/roles",
  },
];
