import { ViewsProps } from "../BaseRepository";

export const projectBidInvitationViews: ViewsProps[] = [
  {
    title: "Tender Invitations",
    server_url: "procurement/bid-invitations",
    component: "ProjectBidInvitations",
    frontend_path: "/procurement/tenders",
    type: "index",
    tag: "Create Tender",
    mode: "list",
  },
  {
    title: "Create Tender",
    server_url: "procurement/bid-invitations",
    component: "ProjectBidInvitation",
    frontend_path: "/procurement/tenders/create",
    type: "form",
    tag: "",
    mode: "store",
    action: "Publish Tender",
    index_path: "/procurement/tenders",
  },
  {
    title: "Manage Tender",
    server_url: "procurement/bid-invitations",
    component: "ProjectBidInvitation",
    frontend_path: "/procurement/tenders/:id/manage",
    type: "form",
    tag: "",
    mode: "update",
    action: "Update Tender",
    index_path: "/procurement/tenders",
  },
];

