import { ViewsProps } from "../BaseRepository";

export const stageCategoryViews: ViewsProps[] = [
  {
    title: "List of Stage Categories",
    server_url: "workflowStageCategories",
    component: "StageCategories",
    frontend_path: "/admin-centre/stage-categories",
    type: "index",
    tag: "Add Stage Category",
    mode: "list",
  },
  {
    title: "Create Stage Category",
    server_url: "workflowStageCategories",
    component: "StageCategory",
    frontend_path: "/admin-centre/stage-categories/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Stage Category",
    index_path: "/admin-centre/stage-categories",
  },
  {
    title: "Manage Stage Category",
    server_url: "workflowStageCategories",
    component: "StageCategory",
    frontend_path: "/admin-centre/stage-categories/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/admin-centre/stage-categories",
  },
];
