export const projectBidRules = {
  project_id: "required|integer|exists:projects,id",
  bid_invitation_id: "required|integer|exists:project_bid_invitations,id",
  vendor_id: "required|integer|exists:vendors,id",
  bid_amount: "required|numeric|min:0",
  bid_currency: "string|max:10",
  submission_method: "in:physical,electronic,hybrid",
  bid_security_submitted: "boolean",
  bid_security_type: "in:bank_guarantee,insurance_bond,cash",
  bid_security_reference: "string|max:100",
};

