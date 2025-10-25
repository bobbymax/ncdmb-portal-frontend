import { ViewsProps } from "../BaseRepository";

export const documentPanelViews: ViewsProps[] = [
  {
    title: "List of Document Panels",
    server_url: "documentPanels",
    component: "DocumentPanels",
    frontend_path: "/admin-centre/document-panels",
    type: "index",
    tag: "Add Document Panel",
    mode: "list",
  },
  {
    title: "Create Document Panel",
    server_url: "documentPanels",
    component: "DocumentPanel",
    frontend_path: "/admin-centre/document-panels/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Document Panel",
    index_path: "/admin-centre/document-panels",
  },
  {
    title: "Manage Document Panel",
    server_url: "documentPanels",
    component: "DocumentPanel",
    frontend_path: "/admin-centre/document-panels/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/admin-centre/document-panels",
  },
];
