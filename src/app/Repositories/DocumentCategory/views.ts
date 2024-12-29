import { ViewsProps } from "../BaseRepository";

export const documentCategoryViews: ViewsProps[] = [
  {
    title: "List of Document Categories",
    server_url: "documentCategories",
    component: "DocumentCategories",
    frontend_path: "/specifications/document-categories",
    type: "index",
    tag: "Add Category",
    mode: "list",
  },
  {
    title: "Create Category",
    server_url: "documentCategories",
    component: "DocumentCategory",
    frontend_path: "/specifications/document-categories/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Category",
    index_path: "/specifications/document-categories",
  },
  {
    title: "Manage Category",
    server_url: "documentCategories",
    component: "DocumentCategory",
    frontend_path: "/specifications/document-categories/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/specifications/document-categories",
  },
];
