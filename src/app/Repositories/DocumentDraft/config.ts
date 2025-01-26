import { ConfigProp } from "../BaseRepository";
import { DocumentDraftResponseData } from "./data";

export const documentDraftConfig: ConfigProp<DocumentDraftResponseData> = {
  fillables: [
    "document_id",
    "group_id",
    "progress_tracker_id",
    "created_by_user_id",
    "current_workflow_stage_id",
    "department_id",
    "authorising_staff_id",
    "document_draftable_id",
    "document_draftable_type",
    "file_path",
    "digital_signature_path",
    "signature",
    "status",
  ],
  associatedResources: [],
  state: {
    id: 0,
    document_id: 0,
    group_id: 0,
    progress_tracker_id: 0,
    created_by_user_id: 0,
    current_workflow_stage_id: 0,
    department_id: 0,
    authorising_staff_id: 0,
    document_draftable_id: 0,
    document_draftable_type: "",
    file_path: "",
    digital_signature_path: "",
    signature: "",
    status: "",
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
