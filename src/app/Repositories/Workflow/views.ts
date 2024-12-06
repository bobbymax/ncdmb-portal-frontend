import { ViewsProps } from "../BaseRepository";

export const workflowViews: ViewsProps[] = [
  {
    title: "List of Workflows",
    server_url: "workflows",
    component: "Workflows",
    frontend_path: "/admin-centre/workflows",
    type: "index",
    tag: "Add Workflow",
    mode: "list",
  },
  {
    title: "Create Workflow",
    server_url: "workflows",
    component: "Workflow",
    frontend_path: "/admin-centre/workflows/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Workflow",
    index_path: "/admin-centre/workflows",
  },
  {
    title: "Manage Workflow",
    server_url: "workflows",
    component: "Workflow",
    frontend_path: "/admin-centre/workflows/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/admin-centre/workflows",
  },
];
