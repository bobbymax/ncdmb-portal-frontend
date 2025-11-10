import { ViewsProps } from "../BaseRepository";

export const inventoryIssueViews: ViewsProps[] = [
  {
    title: "Issues Register",
    server_url: "inventory-issues",
    component: "InventoryIssues",
    frontend_path: "/inventory/issues",
    type: "card",
    mode: "list",
    tag: "Create Issue",
  },
  {
    title: "Create Issue",
    server_url: "inventory-issues",
    component: "InventoryIssue",
    frontend_path: "/inventory/issues/create",
    type: "form",
    mode: "store",
    action: "Post Issue",
    index_path: "/inventory/issues",
  },
  {
    title: "Manage Issue",
    server_url: "inventory-issues",
    component: "InventoryIssue",
    frontend_path: "/inventory/issues/:id/manage",
    type: "form",
    mode: "update",
    action: "Update Issue",
    index_path: "/inventory/issues",
  },
];
