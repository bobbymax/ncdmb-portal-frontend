import { ViewsProps } from "../BaseRepository";

export const productViews: ViewsProps[] = [
  {
    title: "Products",
    server_url: "products",
    component: "Products",
    frontend_path: "/inventory/products",
    type: "index",
    mode: "list",
    tag: "Add Product",
  },
  {
    title: "Create Product",
    server_url: "products",
    component: "Product",
    frontend_path: "/inventory/products/create",
    type: "form",
    mode: "store",
    action: "Add Product",
    index_path: "/inventory/products",
  },
  {
    title: "Manage Product",
    server_url: "products",
    component: "Product",
    frontend_path: "/inventory/products/:id/manage",
    type: "form",
    mode: "update",
    action: "Update Product",
    index_path: "/inventory/products",
  },
  {
    title: "View Product",
    server_url: "products",
    component: "ProductView",
    frontend_path: "/inventory/products/:id/view",
    type: "raw",
    mode: "update",
    action: "Update Product",
    index_path: "/inventory/products",
  },
];
