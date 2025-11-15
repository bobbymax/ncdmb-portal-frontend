import { ViewsProps } from "../BaseRepository";

export const productCategoryViews: ViewsProps[] = [
    {
        title: "List of ProductCategorys",
        server_url: "productCategories",
        component: "ProductCategorys",
        frontend_path: "/inventory/product-categories",
        type: "index",
        tag: "Add ProductCategory",
        mode: "list",
    },
    {
        title: "Create ProductCategory",
        server_url: "productCategories",
        component: "ProductCategory",
        frontend_path: "/inventory/product-categories/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add ProductCategory",
        index_path: "/inventory/product-categories",
    },
    {
        title: "Manage ProductCategory",
        server_url: "productCategories",
        component: "ProductCategory",
        frontend_path: "/inventory/product-categories/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/inventory/product-categories",
    },
];