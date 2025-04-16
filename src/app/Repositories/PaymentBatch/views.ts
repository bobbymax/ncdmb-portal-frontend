import { ViewsProps } from "../BaseRepository";

export const paymentBatchViews: ViewsProps[] = [
  {
    title: "Bacthed Payments",
    server_url: "paymentBatches",
    component: "PaymentBatchs",
    frontend_path: "/budget/batch-payments",
    type: "index",
    tag: "Generate",
    mode: "list",
  },
  {
    title: "Generate Batch",
    server_url: "paymentBatches",
    component: "PaymentBatch",
    frontend_path: "/budget/batch-payments/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Stack Payments",
    index_path: "/budget/batch-payments",
  },
  {
    title: "Manage Batch",
    server_url: "paymentBatches",
    component: "PaymentBatch",
    frontend_path: "/budget/batch-payments/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/budget/batch-payments",
  },
];
