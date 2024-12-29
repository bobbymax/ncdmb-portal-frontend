import { ViewsProps } from "../BaseRepository";

export const remunerationViews: ViewsProps[] = [
    {
        title: "List of Remunerations",
        server_url: "remunerations",
        component: "Remunerations",
        frontend_path: "/specifications/remunerations",
        type: "index",
        tag: "Add Remuneration",
        mode: "list",
    },
    {
        title: "Create Remuneration",
        server_url: "remunerations",
        component: "Remuneration",
        frontend_path: "/specifications/remunerations/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Remuneration",
        index_path: "/specifications/remunerations",
    },
    {
        title: "Manage Remuneration",
        server_url: "remunerations",
        component: "Remuneration",
        frontend_path: "/specifications/remunerations/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/specifications/remunerations",
    },
];