import { ViewsProps } from "../BaseRepository";

export const userViews: ViewsProps[] = [
  {
    title: "Staff List",
    server_url: "users",
    component: "Users",
    frontend_path: "/admin-centre/employees",
    type: "index",
    tag: "Create User",
    mode: "list",
  },
  {
    title: "Create User",
    server_url: "users",
    component: "User",
    frontend_path: "/admin-centre/employees/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add User",
    index_path: "/admin-centre/employees",
  },
  {
    title: "Manage User",
    server_url: "users",
    component: "User",
    frontend_path: "/admin-centre/employees/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/admin-centre/employees",
  },
];
