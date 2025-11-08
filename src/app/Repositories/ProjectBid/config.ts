import { ConfigProp } from "../BaseRepository";
import { ProjectBidResponseData } from "./data";

export const projectBidConfig: ConfigProp<ProjectBidResponseData> = {
  fillables: [
    "project_id",
    "bid_invitation_id",
    "vendor_id",
    "bid_amount",
    "bid_currency",
    "submission_method",
    "bid_security_submitted",
    "bid_security_type",
    "bid_security_reference",
    "bid_documents",
  ],
  
  associatedResources: [
    { name: "projects", url: "projects" },
    { name: "vendors", url: "vendors" },
    { name: "bidInvitations", url: "procurement/bid-invitations" },
  ],
  
  state: {
    id: 0,
    project_id: 0,
    bid_invitation_id: 0,
    vendor_id: 0,
    bid_reference: "",
    bid_amount: 0,
    bid_currency: "NGN",
    submitted_at: null,
    submission_method: "physical",
    received_by: null,
    bid_security_submitted: false,
    bid_security_type: null,
    bid_security_reference: null,
    opened_at: null,
    opened_by: null,
    is_administratively_compliant: null,
    administrative_notes: null,
    technical_score: null,
    technical_status: null,
    technical_notes: null,
    financial_score: null,
    is_financially_responsive: null,
    financial_notes: null,
    combined_score: null,
    ranking: null,
    status: "submitted",
    disqualification_reason: null,
    bid_documents: null,
    created_at: "",
    updated_at: "",
  },
  
  actions: [
    { label: "view", icon: "ri-eye-line", variant: "info", conditions: [], operator: "and", display: "View" },
    { label: "manage", icon: "ri-mail-open-line", variant: "info", conditions: [], operator: "and", display: "Open" },
    { label: "track", icon: "ri-file-list-line", variant: "success", conditions: [], operator: "and", display: "Evaluate" },
    { label: "block", icon: "ri-close-circle-line", variant: "danger", conditions: [], operator: "and", display: "Disqualify" },
  ],
};

