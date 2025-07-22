import { ViewsProps } from "../BaseRepository";

export const milestoneViews: ViewsProps[] = [
    {
        title: "List of Milestones",
        server_url: "milestones",
        component: "Milestones",
        frontend_path: "/desk/milestones",
        type: "index",
        tag: "Add Milestone",
        mode: "list",
    },
    {
        title: "Create Milestone",
        server_url: "milestones",
        component: "Milestone",
        frontend_path: "/desk/milestones/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Milestone",
        index_path: "/desk/milestones",
    },
    {
        title: "Manage Milestone",
        server_url: "milestones",
        component: "Milestone",
        frontend_path: "/desk/milestones/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/desk/milestones",
    },
];