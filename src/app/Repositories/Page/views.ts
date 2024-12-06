import { ViewsProps } from "../BaseRepository";

export const pageViews: ViewsProps[] = [
  {
    title: "Pages List",
    server_url: "pages",
    component: "Pages",
    frontend_path: "/admin-centre/pages",
    type: "index",
    tag: "Add Page",
    mode: "list",
  },
  {
    title: "Create Page",
    server_url: "pages",
    component: "Page",
    frontend_path: "/admin-centre/pages/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Page",
    index_path: "/admin-centre/pages",
  },
  {
    title: "Manage Page",
    server_url: "pages",
    component: "Page",
    frontend_path: "/admin-centre/pages/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/admin-centre/pages",
  },
];
