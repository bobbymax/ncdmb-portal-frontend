import { ViewsProps } from "../BaseRepository";

export const expenditureViews: ViewsProps[] = [
    {
        title: "List of Expenditures",
        server_url: "expenditures",
        component: "Expenditures",
        frontend_path: "/budget/expenditures",
        type: "index",
        tag: "Add Expenditure",
        mode: "list",
    },
    {
        title: "Create Expenditure",
        server_url: "expenditures",
        component: "Expenditure",
        frontend_path: "/budget/expenditures/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Expenditure",
        index_path: "/budget/expenditures",
    },
    {
        title: "Manage Expenditure",
        server_url: "expenditures",
        component: "Expenditure",
        frontend_path: "/budget/expenditures/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/budget/expenditures",
    },
];