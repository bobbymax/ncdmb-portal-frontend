import { ViewsProps } from "../BaseRepository";

export const signatoryViews: ViewsProps[] = [
  {
    title: "Resource Signatories",
    server_url: "signatories",
    component: "Signatorys",
    frontend_path: "/intelligence/signatories",
    type: "index",
    tag: "Add Signatory",
    mode: "list",
  },
  {
    title: "Create Signatory",
    server_url: "signatories",
    component: "Signatory",
    frontend_path: "/intelligence/signatories/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Signatory",
    index_path: "/intelligence/signatories",
  },
  {
    title: "Manage Signatory",
    server_url: "signatories",
    component: "Signatory",
    frontend_path: "/intelligence/signatories/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/intelligence/signatories",
  },
];
