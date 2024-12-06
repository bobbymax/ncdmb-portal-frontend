import { ViewsProps } from "../BaseRepository";

export const gradeLevelViews: ViewsProps[] = [
  {
    title: "List of GradeLevels",
    server_url: "gradeLevels",
    component: "GradeLevels",
    frontend_path: "/admin-centre/grade-levels",
    type: "index",
    tag: "Add GradeLevel",
    mode: "list",
  },
  {
    title: "Create GradeLevel",
    server_url: "gradeLevels",
    component: "GradeLevel",
    frontend_path: "/admin-centre/grade-levels/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add GradeLevel",
    index_path: "/admin-centre/grade-levels",
  },
  {
    title: "Manage GradeLevel",
    server_url: "gradeLevels",
    component: "GradeLevel",
    frontend_path: "/admin-centre/grade-levels/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/admin-centre/grade-levels",
  },
];
