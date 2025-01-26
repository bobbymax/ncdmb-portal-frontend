import { ViewsProps } from "../BaseRepository";

export const tripViews: ViewsProps[] = [
  {
    title: "List of Trips",
    server_url: "trips",
    component: "Trips",
    frontend_path: "/hub/trips",
    type: "index",
    tag: "Add Trip",
    mode: "list",
  },
  {
    title: "Create Trip",
    server_url: "trips",
    component: "Trip",
    frontend_path: "/hub/trips/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Trip",
    index_path: "/hub/trips",
  },
  {
    title: "Manage Trip",
    server_url: "trips",
    component: "Trip",
    frontend_path: "/hub/trips/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/hub/trips",
  },
];
