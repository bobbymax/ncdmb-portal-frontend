import { ConfigProp } from "../BaseRepository";
import { QueryResponseData } from "./data";

export const queryConfig: ConfigProp<QueryResponseData> = {
  fillables: [
    "user_id",
    "group_id",
    "document_id",
    "document_draft_id",
    "message",
    "response",
    "priority",
    "status",
  ],
  associatedResources: [{ name: "", url: "" }],
  state: {
    id: 0,
    user_id: 0,
    group_id: 0,
    document_id: 0,
    document_draft_id: 0,
    message: "",
    response: null,
    priority: "low",
    status: "open",
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
