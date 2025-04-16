import { ViewsProps } from "../BaseRepository";

export const paymentViews: ViewsProps[] = [
  {
    title: "List of Payments",
    server_url: "payments",
    component: "Payments",
    frontend_path: "/accounts/payments",
    type: "index",
    tag: "Add Payment",
    mode: "list",
  },
  {
    title: "Generate Payment Voucher",
    server_url: "payments",
    component: "Payment",
    frontend_path: "/accounts/payments/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Generate Voucher",
    index_path: "/accounts/payments",
  },
  {
    title: "Manage Payment",
    server_url: "payments",
    component: "Payment",
    frontend_path: "/accounts/payments/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/accounts/payments",
  },
];
