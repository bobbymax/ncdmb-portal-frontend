import { ViewsProps } from "../BaseRepository";

export const documentDraftViews: ViewsProps[] = [
    {
        title: "List of DocumentDrafts",
        server_url: "documentDrafts",
        component: "DocumentDrafts",
        frontend_path: "/specification/drafts",
        type: "index",
        tag: "Add DocumentDraft",
        mode: "list",
    },
    {
        title: "Create DocumentDraft",
        server_url: "documentDrafts",
        component: "DocumentDraft",
        frontend_path: "/specification/drafts/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add DocumentDraft",
        index_path: "/specification/drafts",
    },
    {
        title: "Manage DocumentDraft",
        server_url: "documentDrafts",
        component: "DocumentDraft",
        frontend_path: "/specification/drafts/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/specification/drafts",
    },
];