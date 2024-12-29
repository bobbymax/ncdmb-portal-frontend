import { ViewsProps } from "../BaseRepository";

export const tripViews: ViewsProps[] = [
    {
        title: "List of Trips",
        server_url: "trips",
        component: "Trips",
        frontend_path: "/staff-services/trips",
        type: "index",
        tag: "Add Trip",
        mode: "list",
    },
    {
        title: "Create Trip",
        server_url: "trips",
        component: "Trip",
        frontend_path: "/staff-services/trips/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Trip",
        index_path: "/staff-services/trips",
    },
    {
        title: "Manage Trip",
        server_url: "trips",
        component: "Trip",
        frontend_path: "/staff-services/trips/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/staff-services/trips",
    },
];