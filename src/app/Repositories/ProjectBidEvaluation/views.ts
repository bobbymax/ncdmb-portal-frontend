import { ViewsProps } from "../BaseRepository";

export const projectBidEvaluationViews: ViewsProps[] = [
  {
    title: "Bid Evaluations",
    server_url: "procurement/evaluations",
    component: "ProjectBidEvaluations",
    frontend_path: "/procurement/evaluations",
    type: "index",
    tag: "Add Evaluation",
    mode: "list",
  },
  {
    title: "Create Evaluation",
    server_url: "procurement/evaluations",
    component: "ProjectBidEvaluation",
    frontend_path: "/procurement/evaluations/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Submit Evaluation",
    index_path: "/procurement/evaluations",
  },
  {
    title: "Manage Evaluation",
    server_url: "procurement/evaluations",
    component: "ProjectBidEvaluation",
    frontend_path: "/procurement/evaluations/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Evaluation",
    index_path: "/procurement/evaluations",
  },
];

