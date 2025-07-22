import { ViewsProps } from "../BaseRepository";

export const projectCategoryViews: ViewsProps[] = [
  {
    title: "List of Project Categories",
    server_url: "projectCategories",
    component: "ProjectCategories",
    frontend_path: "/intelligence/project-categories",
    type: "index",
    tag: "Add Project Category",
    mode: "list",
  },
  {
    title: "Create ProjectCategory",
    server_url: "projectCategories",
    component: "ProjectCategory",
    frontend_path: "/intelligence/project-categories/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Project Category",
    index_path: "/intelligence/project-categories",
  },
  {
    title: "Manage ProjectCategory",
    server_url: "projectCategories",
    component: "ProjectCategory",
    frontend_path: "/intelligence/project-categories/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/intelligence/project-categories",
  },
];
