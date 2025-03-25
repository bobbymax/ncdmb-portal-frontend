import { ViewsProps } from "../BaseRepository";

export const documentTrailViews: ViewsProps[] = [
    {
        title: "List of DocumentTrails",
        server_url: "documentTrails",
        component: "DocumentTrails",
        frontend_path: "/folders/document-trails",
        type: "index",
        tag: "Add DocumentTrail",
        mode: "list",
    },
    {
        title: "Create DocumentTrail",
        server_url: "documentTrails",
        component: "DocumentTrail",
        frontend_path: "/folders/document-trails/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add DocumentTrail",
        index_path: "/folders/document-trails",
    },
    {
        title: "Manage DocumentTrail",
        server_url: "documentTrails",
        component: "DocumentTrail",
        frontend_path: "/folders/document-trails/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/folders/document-trails",
    },
];