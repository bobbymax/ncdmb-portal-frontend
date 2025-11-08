export const projectBidInvitationRules = {
  project_id: "required|integer|exists:projects,id",
  title: "required|string|max:500",
  description: "string",
  submission_deadline: "required|date|after:today",
  opening_date: "required|date|after:submission_deadline",
  estimated_contract_value: "numeric|min:0",
  technical_weight: "numeric|min:0|max:100",
  financial_weight: "numeric|min:0|max:100",
};

