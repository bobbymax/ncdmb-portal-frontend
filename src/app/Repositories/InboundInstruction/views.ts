import { ViewsProps } from "../BaseRepository";

export const inboundInstructionViews: ViewsProps[] = [
    {
        title: "List of InboundInstructions",
        server_url: "inboundInstructions",
        component: "InboundInstructions",
        frontend_path: "/desk/inbound-instructions",
        type: "index",
        tag: "Add InboundInstruction",
        mode: "list",
    },
    {
        title: "Create InboundInstruction",
        server_url: "inboundInstructions",
        component: "InboundInstruction",
        frontend_path: "/desk/inbound-instructions/create",
        type: "form",
        tag: "",
        mode: "store",
        action: "Add InboundInstruction",
        index_path: "/desk/inbound-instructions",
    },
    {
        title: "Manage InboundInstruction",
        server_url: "inboundInstructions",
        component: "InboundInstruction",
        frontend_path: "/desk/inbound-instructions/:id/manage",
        type: "form",
        tag: "",
        mode: "update",
        action: "Update Record",
        index_path: "/desk/inbound-instructions",
    },
];