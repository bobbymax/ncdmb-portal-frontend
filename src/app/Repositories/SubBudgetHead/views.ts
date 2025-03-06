import { ViewsProps } from "../BaseRepository";

export const subBudgetHeadViews: ViewsProps[] = [
    {
        title: "List of SubBudgetHeads",
        server_url: "subBudgetHeads",
        component: "SubBudgetHeads",
        frontend_path: "/budget/sub-heads",
        type: "index",
        tag: "Add SubBudgetHead",
        mode: "list",
    },
    {
        title: "Create SubBudgetHead",
        server_url: "subBudgetHeads",
        component: "SubBudgetHead",
        frontend_path: "/budget/sub-heads/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add SubBudgetHead",
        index_path: "/budget/sub-heads",
    },
    {
        title: "Manage SubBudgetHead",
        server_url: "subBudgetHeads",
        component: "SubBudgetHead",
        frontend_path: "/budget/sub-heads/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/budget/sub-heads",
    },
];