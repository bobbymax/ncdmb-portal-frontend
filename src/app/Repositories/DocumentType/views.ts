import { ViewsProps } from "../BaseRepository";

export const documentTypeViews: ViewsProps[] = [
  {
    title: "Document Type Lists",
    server_url: "documentTypes",
    component: "DocumentTypes",
    frontend_path: "/specifications/document-types",
    type: "index",
    tag: "Add Document Type",
    mode: "list",
  },
  {
    title: "Create Document Type",
    server_url: "documentTypes",
    component: "DocumentType",
    frontend_path: "/specifications/document-types/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Document Type",
    index_path: "/specifications/document-types",
  },
  {
    title: "Manage Document Type",
    server_url: "documentTypes",
    component: "DocumentType",
    frontend_path: "/specifications/document-types/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/specifications/document-types",
  },
];
