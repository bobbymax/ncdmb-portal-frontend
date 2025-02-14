import { ViewsProps } from "../BaseRepository";

export const fileTemplateViews: ViewsProps[] = [
    {
        title: "List of FileTemplates",
        server_url: "fileTemplates",
        component: "FileTemplates",
        frontend_path: "/desk/templates",
        type: "index",
        tag: "Add FileTemplate",
        mode: "list",
    },
    {
        title: "Create FileTemplate",
        server_url: "fileTemplates",
        component: "FileTemplate",
        frontend_path: "/desk/templates/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add FileTemplate",
        index_path: "/desk/templates",
    },
    {
        title: "Manage FileTemplate",
        server_url: "fileTemplates",
        component: "FileTemplate",
        frontend_path: "/desk/templates/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/desk/templates",
    },
];