import { ViewsProps } from "../BaseRepository";

export const documentUpdateViews: ViewsProps[] = [
    {
        title: "List of DocumentUpdates",
        server_url: "documentUpdates",
        component: "DocumentUpdates",
        frontend_path: "/specifications/document-updates",
        type: "index",
        tag: "Add DocumentUpdate",
        mode: "list",
    },
    {
        title: "Create DocumentUpdate",
        server_url: "documentUpdates",
        component: "DocumentUpdate",
        frontend_path: "/specifications/document-updates/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add DocumentUpdate",
        index_path: "/specifications/document-updates",
    },
    {
        title: "Manage DocumentUpdate",
        server_url: "documentUpdates",
        component: "DocumentUpdate",
        frontend_path: "/specifications/document-updates/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/specifications/document-updates",
    },
];