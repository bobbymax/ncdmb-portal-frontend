import { ConfigProp } from "../BaseRepository";
import { ThreadResponseData } from "./data";

export const threadConfig: ConfigProp<ThreadResponseData> = {
  fillables: [
    "pointer_identifier",
    "identifier",
    "thread_owner_id",
    "recipient_id",
    "category",
    "conversations",
    "priority",
    "status",
    "state",
    "created_at",
  ],
  associatedResources: [],
  state: {
    id: 0,
    pointer_identifier: "",
    identifier: "",
    thread_owner_id: 0,
    recipient_id: 0,
    category: "commented",
    conversations: [],
    priority: "low",
    status: "pending",
    state: "open",
    created_at: new Date().toISOString(),
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
