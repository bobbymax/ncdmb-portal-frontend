import { ViewsProps } from "../BaseRepository";

export const signatureRequestViews: ViewsProps[] = [
    {
        title: "List of SignatureRequests",
        server_url: "signatureRequests",
        component: "SignatureRequests",
        frontend_path: "/folders/signature-requests",
        type: "index",
        tag: "Add SignatureRequest",
        mode: "list",
    },
    {
        title: "Create SignatureRequest",
        server_url: "signatureRequests",
        component: "SignatureRequest",
        frontend_path: "/folders/signature-requests/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add SignatureRequest",
        index_path: "/folders/signature-requests",
    },
    {
        title: "Manage SignatureRequest",
        server_url: "signatureRequests",
        component: "SignatureRequest",
        frontend_path: "/folders/signature-requests/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/folders/signature-requests",
    },
];