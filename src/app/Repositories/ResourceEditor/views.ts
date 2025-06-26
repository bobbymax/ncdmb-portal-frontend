import { ViewsProps } from "../BaseRepository";

export const resourceEditorViews: ViewsProps[] = [
  {
    title: "List of Editors",
    server_url: "resourceEditors",
    component: "ResourceEditors",
    frontend_path: "/intelligence/resource-editors",
    type: "index",
    tag: "Add Editor",
    mode: "list",
  },
  {
    title: "Create Editor",
    server_url: "resourceEditors",
    component: "ResourceEditor",
    frontend_path: "/intelligence/resource-editors/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Editor",
    index_path: "/intelligence/resource-editors",
  },
  {
    title: "Manage Editor",
    server_url: "resourceEditors",
    component: "ResourceEditor",
    frontend_path: "/intelligence/resource-editors/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/intelligence/resource-editors",
  },
];
