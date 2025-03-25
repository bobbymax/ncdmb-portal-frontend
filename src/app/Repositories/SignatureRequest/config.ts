import { ConfigProp } from "../BaseRepository";
import { SignatureRequestResponseData } from "./data";

export const signatureRequestConfig: ConfigProp<SignatureRequestResponseData> =
  {
    fillables: [],
    associatedResources: [{ name: "groups", url: "groups" }],
    state: {
      id: 0,
      user_id: 0,
      document_id: 0,
      document_draft_id: 0,
      department_id: 0,
      group_id: 0,
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
