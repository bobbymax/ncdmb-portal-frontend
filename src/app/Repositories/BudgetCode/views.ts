import { ViewsProps } from "../BaseRepository";

export const budgetCodeViews: ViewsProps[] = [
  {
    title: "List of Budget Codes",
    server_url: "budgetCodes",
    component: "BudgetCodes",
    frontend_path: "/budget/codes",
    type: "index",
    tag: "Add Budget Code",
    mode: "list",
  },
  {
    title: "Create Budget Code",
    server_url: "budgetCodes",
    component: "BudgetCode",
    frontend_path: "/budget/codes/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Budget Code",
    index_path: "/budget/codes",
  },
  {
    title: "Manage Budget Code",
    server_url: "budgetCodes",
    component: "BudgetCode",
    frontend_path: "/budget/codes/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/budget/codes",
  },
];
