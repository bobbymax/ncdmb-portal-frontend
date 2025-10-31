import { ViewsProps } from "../BaseRepository";

export const queryViews: ViewsProps[] = [
    {
        title: "List of Querys",
        server_url: "queries",
        component: "Querys",
        frontend_path: "/desk/queries",
        type: "index",
        tag: "Add Query",
        mode: "list",
    },
    {
        title: "Create Query",
        server_url: "queries",
        component: "Query",
        frontend_path: "/desk/queries/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Query",
        index_path: "/desk/queries",
    },
    {
        title: "Manage Query",
        server_url: "queries",
        component: "Query",
        frontend_path: "/desk/queries/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/desk/queries",
    },
];