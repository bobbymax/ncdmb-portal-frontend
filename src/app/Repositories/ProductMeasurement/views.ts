import { ViewsProps } from "../BaseRepository";

export const productMeasurementViews: ViewsProps[] = [
    {
        title: "List of ProductMeasurements",
        server_url: "productMeasurements",
        component: "ProductMeasurements",
        frontend_path: "/inventory/product-measurements",
        type: "index",
        tag: "Add ProductMeasurement",
        mode: "list",
    },
    {
        title: "Create ProductMeasurement",
        server_url: "productMeasurements",
        component: "ProductMeasurement",
        frontend_path: "/inventory/product-measurements/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add ProductMeasurement",
        index_path: "/inventory/product-measurements",
    },
    {
        title: "Manage ProductMeasurement",
        server_url: "productMeasurements",
        component: "ProductMeasurement",
        frontend_path: "/inventory/product-measurements/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/inventory/product-measurements",
    },
];