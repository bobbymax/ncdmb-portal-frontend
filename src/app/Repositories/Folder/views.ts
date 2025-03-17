import { ViewsProps } from "../BaseRepository";

export const folderViews: ViewsProps[] = [
  {
    title: "Desk Folders",
    server_url: "documents",
    component: "Folders",
    frontend_path: "/desk/folders",
    type: "card",
    tag: "",
    mode: "list",
  },
  {
    title: "Create Folder",
    server_url: "documents",
    component: "Folder",
    frontend_path: "/desk/folders/create",
    type: "docket",
    tag: "",
    mode: "store",
    action: "Add Folder",
    index_path: "/desk/folders",
  },
  {
    title: "Manage Folder",
    server_url: "documents",
    component: "Folder",
    frontend_path: "/desk/folders/:id/manage",
    type: "docket",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/desk/folders",
  },
];
