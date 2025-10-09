import { ConfigProp } from "../BaseRepository";
import { DocumentDraftResponseData } from "./data";

export const documentDraftConfig: ConfigProp<DocumentDraftResponseData> = {
  fillables: [
    "document_id",
    "group_id",
    "progress_tracker_id",
    "current_workflow_stage_id",
    "department_id",
    "status",
    "amount",
    "taxable_amount",
    "document_action_id",
    "operator_id",
  ],
  associatedResources: [],
  state: {
    id: 0,
    document_id: 0,
    document_action_id: 0,
    group_id: 0,
    progress_tracker_id: 0,
    current_workflow_stage_id: 0,
    department_id: 0,
    amount: "",
    taxable_amount: "",
    status: "",
    ref: "",
    operator_id: 0,
    operator: null,
    version_number: 0,
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
