import { ViewsProps } from "../BaseRepository";

export const invoiceViews: ViewsProps[] = [
    {
        title: "List of Invoices",
        server_url: "invoices",
        component: "Invoices",
        frontend_path: "/desk/invoices",
        type: "index",
        tag: "Add Invoice",
        mode: "list",
    },
    {
        title: "Create Invoice",
        server_url: "invoices",
        component: "Invoice",
        frontend_path: "/desk/invoices/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Invoice",
        index_path: "/desk/invoices",
    },
    {
        title: "Manage Invoice",
        server_url: "invoices",
        component: "Invoice",
        frontend_path: "/desk/invoices/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/desk/invoices",
    },
];