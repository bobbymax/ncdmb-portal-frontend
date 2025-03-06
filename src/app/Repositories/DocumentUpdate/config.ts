import { ConfigProp } from "../BaseRepository";
import { DocumentUpdateResponseData } from "./data";

export const documentUpdateConfig: ConfigProp<DocumentUpdateResponseData> = {
  fillables: [
    "document_action_id",
    "document_draft_id",
    "user_id",
    "comment",
    "status",
    "threads",
  ],
  associatedResources: [],
  state: {
    id: 0,
    document_action_id: 0,
    user_id: 0,
    document_draft_id: 0,
    comment: "",
    threads: [],
    status: "pending",
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
