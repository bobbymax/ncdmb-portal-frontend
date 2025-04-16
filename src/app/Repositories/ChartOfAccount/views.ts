import { ViewsProps } from "../BaseRepository";

export const chartOfAccountViews: ViewsProps[] = [
  {
    title: "Chart Of Accounts List",
    server_url: "chartOfAccounts",
    component: "ChartOfAccounts",
    frontend_path: "/accounts/chart-of-accounts",
    type: "index",
    tag: "Add Chart Of Account",
    mode: "list",
  },
  {
    title: "Create Chart Of Account",
    server_url: "chartOfAccounts",
    component: "ChartOfAccount",
    frontend_path: "/accounts/chart-of-accounts/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Chart Of Account",
    index_path: "/accounts/chart-of-accounts",
  },
  {
    title: "Manage Chart Of Account",
    server_url: "chartOfAccounts",
    component: "ChartOfAccount",
    frontend_path: "/accounts/chart-of-accounts/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/accounts/chart-of-accounts",
  },
];
