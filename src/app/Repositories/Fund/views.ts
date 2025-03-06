import { ViewsProps } from "../BaseRepository";

export const fundViews: ViewsProps[] = [
  {
    title: "List of Funds",
    server_url: "funds",
    component: "Funds",
    frontend_path: "/budget/funds",
    type: "index",
    tag: "",
    mode: "list",
  },
  {
    title: "Create Fund",
    server_url: "funds",
    component: "Fund",
    frontend_path: "/budget/funds/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Fund",
    index_path: "/budget/funds",
  },
  {
    title: "Manage Fund",
    server_url: "funds",
    component: "Fund",
    frontend_path: "/budget/funds/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/budget/funds",
  },
];
