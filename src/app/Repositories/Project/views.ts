import { ViewsProps } from "../BaseRepository";

export const projectViews: ViewsProps[] = [
  {
    title: "List of Projects",
    server_url: "projects",
    component: "Projects",
    frontend_path: "/procurement/projects",
    type: "card",
    tag: "Add Project",
    mode: "list",
  },
  {
    title: "Create Project",
    server_url: "projects",
    component: "Project",
    frontend_path: "/procurement/projects/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Project",
    index_path: "/procurement/projects",
  },
  {
    title: "Manage Project",
    server_url: "projects",
    component: "Project",
    frontend_path: "/procurement/projects/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/procurement/projects",
  },
];
