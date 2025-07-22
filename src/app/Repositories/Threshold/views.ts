import { ViewsProps } from "../BaseRepository";

export const thresholdViews: ViewsProps[] = [
  {
    title: "List of Thresholds",
    server_url: "thresholds",
    component: "Thresholds",
    frontend_path: "/intelligence/thresholds",
    type: "index",
    tag: "Add Threshold",
    mode: "list",
  },
  {
    title: "Create Threshold",
    server_url: "thresholds",
    component: "Threshold",
    frontend_path: "/intelligence/thresholds/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Threshold",
    index_path: "/intelligence/thresholds",
  },
  {
    title: "Manage Threshold",
    server_url: "thresholds",
    component: "Threshold",
    frontend_path: "/intelligence/thresholds/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/intelligence/thresholds",
  },
];
