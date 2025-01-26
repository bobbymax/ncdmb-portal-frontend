import { ViewsProps } from "../BaseRepository";

export const verificationViews: ViewsProps[] = [
  {
    title: "Files",
    server_url: "documents",
    component: "Verifications",
    frontend_path: "/requests/verifications",
    type: "card",
    tag: "",
    mode: "list",
  },
  {
    title: "Create Verification",
    server_url: "documents",
    component: "Verification",
    frontend_path: "/requests/verifications/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Verification",
    index_path: "/requests/verifications",
  },
  {
    title: "Manage Verification",
    server_url: "documents",
    component: "Verification",
    frontend_path: "/requests/verifications/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/requests/verifications",
  },
];
