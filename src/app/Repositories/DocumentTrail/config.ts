import { ConfigProp } from "../BaseRepository";
import { DocumentTrailResponseData } from "./data";

export const documentTrailConfig: ConfigProp<DocumentTrailResponseData> = {
  fillables: [
    "document_id",
    "document_draft_id",
    "document_action_id",
    "document_trailable_id",
    "document_trailable_type",
    "user_id",
    "reason",
  ],
  associatedResources: [],
  state: {
    id: 0,
    document_id: 0,
    document_draft_id: 0,
    document_action_id: 0,
    document_trailable_id: 0,
    document_trailable_type: "",
    user_id: 0,
    reason: "",
  },
  actions: [],
};
