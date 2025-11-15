import { ViewsProps } from "../BaseRepository";

export const productStockViews: ViewsProps[] = [
    {
        title: "List of ProductStocks",
        server_url: "productStocks",
        component: "ProductStocks",
        frontend_path: "/inventory/product-stocks",
        type: "index",
        tag: "Add ProductStock",
        mode: "list",
    },
    {
        title: "Create ProductStock",
        server_url: "productStocks",
        component: "ProductStock",
        frontend_path: "/inventory/product-stocks/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add ProductStock",
        index_path: "/inventory/product-stocks",
    },
    {
        title: "Manage ProductStock",
        server_url: "productStocks",
        component: "ProductStock",
        frontend_path: "/inventory/product-stocks/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/inventory/product-stocks",
    },
];