import { ViewsProps } from "../BaseRepository";

export const allowanceViews: ViewsProps[] = [
  {
    title: "List of Allowances",
    server_url: "allowances",
    component: "Allowances",
    frontend_path: "/specifications/allowances",
    type: "index",
    tag: "Add Allowance",
    mode: "list",
  },
  {
    title: "Add Allowance",
    server_url: "allowances",
    component: "Allowance",
    frontend_path: "/specifications/allowances/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Allowance",
    index_path: "/specifications/allowances",
  },
  {
    title: "Manage Allowance",
    server_url: "allowances",
    component: "Allowance",
    frontend_path: "/specifications/allowances/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/specifications/allowances",
  },
];
