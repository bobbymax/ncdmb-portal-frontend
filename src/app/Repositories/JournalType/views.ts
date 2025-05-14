import { ViewsProps } from "../BaseRepository";

export const journalTypeViews: ViewsProps[] = [
    {
        title: "List of JournalTypes",
        server_url: "journalTypes",
        component: "JournalTypes",
        frontend_path: "/accounts/journal-types",
        type: "index",
        tag: "Add JournalType",
        mode: "list",
    },
    {
        title: "Create JournalType",
        server_url: "journalTypes",
        component: "JournalType",
        frontend_path: "/accounts/journal-types/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add JournalType",
        index_path: "/accounts/journal-types",
    },
    {
        title: "Manage JournalType",
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