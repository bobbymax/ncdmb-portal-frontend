import { ViewsProps } from "../BaseRepository";

export const budgetHeadViews: ViewsProps[] = [
    {
        title: "List of BudgetHeads",
        server_url: "budgetHeads",
        component: "BudgetHeads",
        frontend_path: "/budget/heads",
        type: "index",
        tag: "Add BudgetHead",
        mode: "list",
    },
    {
        title: "Create BudgetHead",
        server_url: "budgetHeads",
        component: "BudgetHead",
        frontend_path: "/budget/heads/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add BudgetHead",
        index_path: "/budget/heads",
    },
    {
        title: "Manage BudgetHead",
        server_url: "budgetHeads",
        component: "BudgetHead",
        frontend_path: "/budget/heads/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/budget/heads",
    },
];