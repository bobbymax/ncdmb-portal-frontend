import { ViewsProps } from "../BaseRepository";

export const claimViews: ViewsProps[] = [
  {
    title: "List of Claims",
    server_url: "claims",
    component: "Claims",
    frontend_path: "/staff-services/claims",
    type: "card",
    tag: "Register Claim",
    mode: "list",
    pointer: "categories",
  },
  {
    title: "Claim Categories",
    server_url: "documentCategories",
    component: "ClaimCategories",
    frontend_path: "/staff-services/claims/categories",
    type: "card",
    tag: "",
    mode: "list",
    index_path: "/staff-services/claims",
    pointer: "/staff-services/claims/create",
  },
  {
    title: "Register Claim",
    server_url: "claims",
    component: "Claim",
    frontend_path: "/staff-services/claims/:categoryId/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Register Claim",
    index_path: "/staff-services/claims",
  },
  {
    title: "Manage Claim",
    server_url: "claims",
    component: "Claim",
    frontend_path: "/staff-services/claims/:categoryId/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Claim",
    index_path: "/staff-services/claims",
  },
  {
    title: "Claim Details",
    server_url: "claims",
    component: "ClaimDetail",
    frontend_path: "/staff-services/claims/:categoryId/:id/view",
    type: "page",
    tag: "",
    mode: "update",
    action: "Update Claim",
    index_path: "/staff-services/claims",
    documentControl: ["ClaimDetails", "ClaimUpdates"],
    tabs: [],
  },
];
