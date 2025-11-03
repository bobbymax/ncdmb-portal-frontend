import { ConfigProp } from "../BaseRepository";
import { InboundInstructionResponseData } from "./data";

export const inboundInstructionConfig: ConfigProp<InboundInstructionResponseData> =
  {
    fillables: [
      "inbound_id",
      "created_by_id",
      "instruction_type",
      "instruction_text",
      "notes",
      "assignable_type",
      "assignable_id",
      "category",
      "status",
      "priority",
      "due_date",
      "completed_at",
      "started_at",
      "completion_notes",
      "completed_by_id",
    ],
    associatedResources: [
      { name: "inbounds", url: "inbounds" },
      { name: "users", url: "users" },
      { name: "departments", url: "departments" },
      { name: "groups", url: "groups" },
    ],
    state: {
      id: 0,
      inbound_id: 0,
      created_by_id: 0,
      instruction_type: "review",
      instruction_text: "",
      notes: {},
      assignable_id: 0,
      assignable_type: "",
      category: "user",
      status: "pending",
      priority: "low",
      due_date: "",
      completed_at: "",
      started_at: "",
      completion_notes: "",
      completed_by_id: null,
    },
    actions: [
      {
        label: "manage",
        icon: "ri-settings-3-line",
        variant: "success",
        conditions: [],
        operator: "and",
        display: "Manage",
      },
    ],
  };
