import { ViewsProps } from "../BaseRepository";

export const entityViews: ViewsProps[] = [
  {
    title: "List of Entities",
    server_url: "entities",
    component: "Entities",
    frontend_path: "/intelligence/entities",
    type: "index",
    tag: "Add Entity",
    mode: "list",
  },
  {
    title: "Create Entity",
    server_url: "entities",
    component: "Entity",
    frontend_path: "/intelligence/entities/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Entity",
    index_path: "/intelligence/entities",
  },
  {
    title: "Manage Entity",
    server_url: "entities",
    component: "Entity",
    frontend_path: "/intelligence/entities/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/intelligence/entities",
  },
];
