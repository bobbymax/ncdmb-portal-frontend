import { ViewsProps } from "../BaseRepository";

export const expenseViews: ViewsProps[] = [
  {
    title: "List of Expenses",
    server_url: "expenses",
    component: "Expenses",
    frontend_path: "/hub/claim/expenses",
    type: "index",
    tag: "Add Expense",
    mode: "list",
  },
  {
    title: "Create Expense",
    server_url: "expenses",
    component: "Expense",
    frontend_path: "/hub/claim/expenses/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Expense",
    index_path: "/hub/claim/expenses",
  },
  {
    title: "Manage Expense",
    server_url: "expenses",
    component: "Expense",
    frontend_path: "/hub/claim/expenses/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/hub/claim/expenses",
  },
];
