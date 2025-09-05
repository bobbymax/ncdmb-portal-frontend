import { ConfigProp } from "../BaseRepository";
import { SignatureResponseData } from "./data";

export const signatureConfig: ConfigProp<SignatureResponseData> = {
  fillables: ["document_draft_id", "signatory_id", "user_id", "signature"],
  associatedResources: [],
  state: {
    id: 0,
    type: "owner",
    signatory_id: 0,
    user_id: 0,
    document_draft_id: 0,
    flow_type: "from",
    signature: "",
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
