import { ViewsProps } from "../BaseRepository";

export const locationViews: ViewsProps[] = [
    {
        title: "List of Locations",
        server_url: "locations",
        component: "Locations",
        frontend_path: "/specifications/locations",
        type: "index",
        tag: "Add Location",
        mode: "list",
    },
    {
        title: "Create Location",
        server_url: "locations",
        component: "Location",
        frontend_path: "/specifications/locations/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Location",
        index_path: "/specifications/locations",
    },
    {
        title: "Manage Location",
        server_url: "locations",
        component: "Location",
        frontend_path: "/specifications/locations/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/specifications/locations",
    },
];