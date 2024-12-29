import { ViewsProps } from "../BaseRepository";

export const cityViews: ViewsProps[] = [
    {
        title: "List of Citys",
        server_url: "cities",
        component: "Citys",
        frontend_path: "/specifications/cities",
        type: "index",
        tag: "Add City",
        mode: "list",
    },
    {
        title: "Create City",
        server_url: "cities",
        component: "City",
        frontend_path: "/specifications/cities/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add City",
        index_path: "/specifications/cities",
    },
    {
        title: "Manage City",
        server_url: "cities",
        component: "City",
        frontend_path: "/specifications/cities/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/specifications/cities",
    },
];