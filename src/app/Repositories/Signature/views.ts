import { ViewsProps } from "../BaseRepository";

export const signatureViews: ViewsProps[] = [
    {
        title: "List of Signatures",
        server_url: "signatures",
        component: "Signatures",
        frontend_path: "/intelligence/signatures",
        type: "index",
        tag: "Add Signature",
        mode: "list",
    },
    {
        title: "Create Signature",
        server_url: "signatures",
        component: "Signature",
        frontend_path: "/intelligence/signatures/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add Signature",
        index_path: "/intelligence/signatures",
    },
    {
        title: "Manage Signature",
        server_url: "signatures",
        component: "Signature",
        frontend_path: "/intelligence/signatures/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/intelligence/signatures",
    },
];