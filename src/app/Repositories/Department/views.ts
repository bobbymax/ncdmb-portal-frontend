import { ViewsProps } from "../BaseRepository";

export const departmentViews: ViewsProps[] = [
  {
    title: "Departments List",
    server_url: "departments",
    component: "Departments",
    frontend_path: "/admin-centre/departments",
    type: "index",
    tag: "Add Department",
    mode: "list",
  },
  {
    title: "Create Department",
    server_url: "departments",
    component: "Department",
    frontend_path: "/admin-centre/departments/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Department",
    index_path: "/admin-centre/departments",
  },
  {
    title: "Manage Department",
    server_url: "departments",
    component: "Department",
    frontend_path: "/admin-centre/departments/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/admin-centre/departments",
  },
];
