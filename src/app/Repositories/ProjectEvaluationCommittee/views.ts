import { ViewsProps } from "../BaseRepository";

export const projectEvaluationCommitteeViews: ViewsProps[] = [
  {
    title: "Evaluation Committees",
    server_url: "procurement/committees",
    component: "ProjectEvaluationCommittees",
    frontend_path: "/procurement/committees",
    type: "index",
    tag: "Form Committee",
    mode: "list",
  },
  {
    title: "Form Committee",
    server_url: "procurement/committees",
    component: "ProjectEvaluationCommittee",
    frontend_path: "/procurement/committees/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Create Committee",
    index_path: "/procurement/committees",
  },
  {
    title: "Manage Committee",
    server_url: "procurement/committees",
    component: "ProjectEvaluationCommittee",
    frontend_path: "/procurement/committees/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Committee",
    index_path: "/procurement/committees",
  },
];

