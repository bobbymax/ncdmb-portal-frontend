import { ViewsProps } from "../BaseRepository";

export const blockViews: ViewsProps[] = [
  {
    title: "Internal Memo Blocks",
    server_url: "blocks",
    component: "Blocks",
    frontend_path: "/intelligence/blocks",
    type: "index",
    tag: "Add Block",
    mode: "list",
  },
  {
    title: "Create Memo Block",
    server_url: "blocks",
    component: "Block",
    frontend_path: "/intelligence/blocks/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Block",
    index_path: "/intelligence/blocks",
  },
  {
    title: "Manage Block",
    server_url: "blocks",
    component: "Block",
    frontend_path: "/intelligence/blocks/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/intelligence/blocks",
  },
];
