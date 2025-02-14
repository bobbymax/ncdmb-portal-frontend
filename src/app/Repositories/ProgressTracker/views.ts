import { ViewsProps } from "../BaseRepository";

export const progressTrackerViews: ViewsProps[] = [
  {
    title: "Workflow Trackers",
    server_url: "workflows",
    component: "ProgressTrackers",
    frontend_path: "/admin-centre/progress-trackers",
    type: "card",
    tag: "Add Tracker",
    mode: "list",
  },
  {
    title: "Create Progress Tracker",
    server_url: "progressTrackers",
    component: "ProgressTracker",
    frontend_path: "/admin-centre/progress-trackers/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Tracker",
    index_path: "/admin-centre/progress-trackers",
  },
  {
    title: "Manage Tracker",
    server_url: "progressTrackers",
    component: "ProgressTracker",
    frontend_path: "/admin-centre/progress-trackers/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/admin-centre/progress-trackers",
  },
];
