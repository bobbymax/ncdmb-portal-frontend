import { ViewsProps } from "../BaseRepository";

export const processCardViews: ViewsProps[] = [
    {
        title: "List of ProcessCards",
        server_url: "processCards",
        component: "ProcessCards",
        frontend_path: "/intelligence/process-cards",
        type: "index",
        tag: "Add ProcessCard",
        mode: "list",
    },
    {
        title: "Create ProcessCard",
        server_url: "processCards",
        component: "ProcessCard",
        frontend_path: "/intelligence/process-cards/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add ProcessCard",
        index_path: "/intelligence/process-cards",
    },
    {
        title: "Manage ProcessCard",
        server_url: "processCards",
        component: "ProcessCard",
        frontend_path: "/intelligence/process-cards/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/intelligence/process-cards",
    },
];