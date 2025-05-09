import { ViewsProps } from "../BaseRepository";

export const transactionViews: ViewsProps[] = [
    {
        title: "List of Transactions",
        server_url: "transactions",
        component: "Transactions",
        frontend_path: "/accounts/transactions",
        type: "index",
        tag: "Add Transaction",
        mode: "list",
    },
    {
        title: "Create Transaction",
        server_url: "transactions",
        component: "Transaction",
        frontend_path: "/accounts/transactions/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Transaction",
        index_path: "/accounts/transactions",
    },
    {
        title: "Manage Transaction",
        server_url: "transactions",
        component: "Transaction",
        frontend_path: "/accounts/transactions/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/accounts/transactions",
    },
];