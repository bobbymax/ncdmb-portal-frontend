import { ViewsProps } from "../BaseRepository";

export const mailingListViews: ViewsProps[] = [
  {
    title: "Mailing Lists",
    server_url: "mailingLists",
    component: "MailingLists",
    frontend_path: "/admin-centre/mailing-lists",
    type: "index",
    tag: "Add Mailing List",
    mode: "list",
  },
  {
    title: "Create Mailing List",
    server_url: "mailingLists",
    component: "MailingList",
    frontend_path: "/admin-centre/mailing-lists/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Mailing List",
    index_path: "/admin-centre/mailing-lists",
  },
  {
    title: "Manage Mailing List",
    server_url: "mailingLists",
    component: "MailingList",
    frontend_path: "/admin-centre/mailing-lists/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/admin-centre/mailing-lists",
  },
];
