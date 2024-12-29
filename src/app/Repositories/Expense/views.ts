import { ViewsProps } from "../BaseRepository";

export const expenseViews: ViewsProps[] = [
    {
        title: "List of Expenses",
        server_url: "expenses",
        component: "Expenses",
        frontend_path: "/staff-services/claim/expenses",
        type: "index",
        tag: "Add Expense",
        mode: "list",
    },
    {
        title: "Create Expense",
        server_url: "expenses",
        component: "Expense",
        frontend_path: "/staff-services/claim/expenses/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Expense",
        index_path: "/staff-services/claim/expenses",
    },
    {
        title: "Manage Expense",
        server_url: "expenses",
        component: "Expense",
        frontend_path: "/staff-services/claim/expenses/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/staff-services/claim/expenses",
    },
];