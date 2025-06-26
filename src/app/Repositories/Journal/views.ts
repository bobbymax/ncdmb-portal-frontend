import { ViewsProps } from "../BaseRepository";

export const journalViews: ViewsProps[] = [
    {
        title: "List of Journals",
        server_url: "journals",
        component: "Journals",
        frontend_path: "/accounts/journals",
        type: "index",
        tag: "Add Journal",
        mode: "list",
    },
    {
        title: "Create Journal",
        server_url: "journals",
        component: "Journal",
        frontend_path: "/accounts/journals/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Journal",
        index_path: "/accounts/journals",
    },
    {
        title: "Manage Journal",
        server_url: "journals",
        component: "Journal",
        frontend_path: "/accounts/journals/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/accounts/journals",
    },
];