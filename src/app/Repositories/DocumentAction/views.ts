import { ViewsProps } from "../BaseRepository";

export const documentActionViews: ViewsProps[] = [
  {
    title: "List of Actions",
    server_url: "documentActions",
    component: "DocumentActions",
    frontend_path: "/specifications/document-actions",
    type: "index",
    tag: "Add Action",
    mode: "list",
  },
  {
    title: "Create Action",
    server_url: "documentActions",
    component: "DocumentAction",
    frontend_path: "/specifications/document-actions/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Action",
    index_path: "/specifications/document-actions",
  },
  {
    title: "Manage Action",
    server_url: "documentActions",
    component: "DocumentAction",
    frontend_path: "/specifications/document-actions/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/specifications/document-actions",
  },
];
