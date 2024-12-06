import { ViewsProps } from "../BaseRepository";

export const workflowStageViews: ViewsProps[] = [
  {
    title: "List of Process Flows",
    server_url: "workflowStages",
    component: "WorkflowStages",
    frontend_path: "/admin-centre/stages",
    type: "index",
    tag: "Add Process",
    mode: "list",
  },
  {
    title: "Create Process",
    server_url: "workflowStages",
    component: "WorkflowStage",
    frontend_path: "/admin-centre/stages/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Process",
    index_path: "/admin-centre/stages",
  },
  {
    title: "Manage Process",
    server_url: "workflowStages",
    component: "WorkflowStage",
    frontend_path: "/admin-centre/stages/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/admin-centre/stages",
  },
];
