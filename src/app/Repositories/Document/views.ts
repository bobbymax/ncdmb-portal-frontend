import { ViewsProps } from "../BaseRepository";

export const documentViews: ViewsProps[] = [
    {
        title: "List of Documents",
        server_url: "documents",
        component: "Documents",
        frontend_path: "/specifications/documents",
        type: "index",
        tag: "Add Document",
        mode: "list",
    },
    {
        title: "Create Document",
        server_url: "documents",
        component: "Document",
        frontend_path: "/specifications/documents/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Document",
        index_path: "/specifications/documents",
    },
    {
        title: "Manage Document",
        server_url: "documents",
        component: "Document",
        frontend_path: "/specifications/documents/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/specifications/documents",
    },
];