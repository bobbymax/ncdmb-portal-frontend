import { ViewsProps } from "../BaseRepository";

export const threadViews: ViewsProps[] = [
    {
        title: "List of Threads",
        server_url: "threads",
        component: "Threads",
        frontend_path: "/documents/threads",
        type: "index",
        tag: "Add Thread",
        mode: "list",
    },
    {
        title: "Create Thread",
        server_url: "threads",
        component: "Thread",
        frontend_path: "/documents/threads/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Thread",
        index_path: "/documents/threads",
    },
    {
        title: "Manage Thread",
        server_url: "threads",
        component: "Thread",
        frontend_path: "/documents/threads/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/documents/threads",
    },
];