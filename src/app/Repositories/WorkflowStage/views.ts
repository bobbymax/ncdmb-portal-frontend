import { ViewsProps } from "../BaseRepository";

export const workflowStageViews: ViewsProps[] = [
  {
    title: "List of Workflow Stages",
    server_url: "workflowStages",
    component: "WorkflowStages",
    frontend_path: "/admin-centre/stages",
    type: "index",
    tag: "Add Stage",
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
    action: "Add Stage",
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
    action: "Update Stage",
    index_path: "/admin-centre/stages",
  },
];
