import { ViewsProps } from "../BaseRepository";

export const groupViews: ViewsProps[] = [
    {
        title: "List of Groups",
        server_url: "groups",
        component: "Groups",
        frontend_path: "/admin-centre/groups",
        type: "index",
        tag: "Add Group",
        mode: "list",
    },
    {
        title: "Create Group",
        server_url: "groups",
        component: "Group",
        frontend_path: "/admin-centre/groups/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Group",
        index_path: "/admin-centre/groups",
    },
    {
        title: "Manage Group",
        server_url: "groups",
        component: "Group",
        frontend_path: "/admin-centre/groups/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/admin-centre/groups",
    },
];