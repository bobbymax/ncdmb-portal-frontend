import { ViewsProps } from "../BaseRepository";

export const projectBidViews: ViewsProps[] = [
  {
    title: "Submitted Bids",
    server_url: "procurement/bids",
    component: "ProjectBids",
    frontend_path: "/procurement/bids",
    type: "index",
    tag: "Register Bid",
    mode: "list",
  },
  {
    title: "Register Bid",
    server_url: "procurement/bids",
    component: "ProjectBid",
    frontend_path: "/procurement/bids/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Submit Bid",
    index_path: "/procurement/bids",
  },
  {
    title: "Manage Bid",
    server_url: "procurement/bids",
    component: "ProjectBid",
    frontend_path: "/procurement/bids/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Bid",
    index_path: "/procurement/bids",
  },
];

