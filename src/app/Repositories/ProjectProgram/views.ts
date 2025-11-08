import { ViewsProps } from "../BaseRepository";

export const projectProgramViews: ViewsProps[] = [
  {
    title: "Project Programs",
    server_url: "projectPrograms",
    component: "ProjectPrograms",
    frontend_path: "/procurement/programs",
    type: "index",
    tag: "Create Program",
    mode: "list",
  },
  {
    title: "Create Project Program",
    server_url: "projectPrograms",
    component: "ProjectProgram",
    frontend_path: "/procurement/programs/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Create Program",
    index_path: "/procurement/programs",
  },
  {
    title: "Manage Project Program",
    server_url: "projectPrograms",
    component: "ProjectProgram",
    frontend_path: "/procurement/programs/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Program",
    index_path: "/procurement/programs",
  },
];
