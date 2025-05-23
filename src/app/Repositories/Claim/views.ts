import { ViewsProps } from "../BaseRepository";

export const claimViews: ViewsProps[] = [
  {
    title: "List of Claims",
    server_url: "claims",
    component: "Claims",
    frontend_path: "/hub/claims",
    type: "card",
    tag: "Register Claim",
    mode: "list",
    pointer: "categories",
  },
  {
    title: "Claim Categories",
    server_url: "documentCategories",
    component: "ClaimCategories",
    frontend_path: "/hub/claims/categories",
    type: "card",
    tag: "",
    mode: "list",
    index_path: "/hub/claims",
    pointer: "/hub/claims/create",
  },
  {
    title: "Register Claim",
    server_url: "claims",
    component: "Claim",
    frontend_path: "/hub/claims/:categoryId/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Register Claim",
    index_path: "/hub/claims",
  },
  {
    title: "Manage Claim",
    server_url: "claims",
    component: "Claim",
    frontend_path: "/hub/claims/:categoryId/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Claim",
    index_path: "/hub/claims",
  },
  {
    title: "Claim Documentation",
    server_url: "claims",
    component: "ClaimDetail",
    frontend_path: "/hub/claims/:categoryId/:id/view",
    type: "page",
    tag: "",
    mode: "update",
    action: "Update Claim",
    index_path: "/hub/claims",
    documentControl: ["ClaimDetails", "ClaimUpdates"],
  },
];
