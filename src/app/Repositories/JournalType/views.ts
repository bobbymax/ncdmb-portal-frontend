import { ViewsProps } from "../BaseRepository";

export const journalTypeViews: ViewsProps[] = [
  {
    title: "Journal Types",
    server_url: "journalTypes",
    component: "JournalTypes",
    frontend_path: "/accounts/journal-types",
    type: "index",
    tag: "Add Journal Type",
    mode: "list",
  },
  {
    title: "Create Journal Type",
    server_url: "journalTypes",
    component: "JournalType",
    frontend_path: "/accounts/journal-types/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Journal Type",
    index_path: "/accounts/journal-types",
  },
  {
    title: "Manage Journal Type",
    server_url: "journalTypes",
    component: "JournalType",
    frontend_path: "/accounts/journal-types/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/accounts/journal-types",
  },
];
