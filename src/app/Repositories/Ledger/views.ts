import { ViewsProps } from "../BaseRepository";

export const ledgerViews: ViewsProps[] = [
  {
    title: "Ledgers",
    server_url: "ledgers",
    component: "Ledgers",
    frontend_path: "/accounts/ledgers",
    type: "card",
    tag: "Create Ledger",
    mode: "list",
  },
  {
    title: "Create Ledger",
    server_url: "ledgers",
    component: "Ledger",
    frontend_path: "/accounts/ledgers/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Add Ledger",
    index_path: "/accounts/ledgers",
  },
  {
    title: "Manage Ledger",
    server_url: "ledgers",
    component: "Ledger",
    frontend_path: "/accounts/ledgers/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Record",
    index_path: "/accounts/ledgers",
  },
];
