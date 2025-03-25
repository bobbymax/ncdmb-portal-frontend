import { ViewsProps } from "../BaseRepository";

export const widgetViews: ViewsProps[] = [
    {
        title: "List of Widgets",
        server_url: "widgets",
        component: "Widgets",
        frontend_path: "/intelligence/widgets",
        type: "index",
        tag: "Add Widget",
        mode: "list",
    },
    {
        title: "Create Widget",
        server_url: "widgets",
        component: "Widget",
        frontend_path: "/intelligence/widgets/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Widget",
        index_path: "/intelligence/widgets",
    },
    {
        title: "Manage Widget",
        server_url: "widgets",
        component: "Widget",
        frontend_path: "/intelligence/widgets/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/intelligence/widgets",
    },
];