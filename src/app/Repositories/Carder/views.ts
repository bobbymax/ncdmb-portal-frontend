import { ViewsProps } from "../BaseRepository";

export const carderViews: ViewsProps[] = [
    {
        title: "List of Carders",
        server_url: "carders",
        component: "Carders",
        frontend_path: "/specifications/carders",
        type: "index",
        tag: "Add Carder",
        mode: "list",
    },
    {
        title: "Create Carder",
        server_url: "carders",
        component: "Carder",
        frontend_path: "/specifications/carders/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Carder",
        index_path: "/specifications/carders",
    },
    {
        title: "Manage Carder",
        server_url: "carders",
        component: "Carder",
        frontend_path: "/specifications/carders/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/specifications/carders",
    },
];