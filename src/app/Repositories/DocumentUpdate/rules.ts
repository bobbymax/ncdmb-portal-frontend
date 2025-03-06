export const documentUpdateRules: { [key: string]: string } = {
  document_draft_id: "required|integer",
  document_action_id: "required|integer",
  user_id: "required|integer",
  comment: "required|string",
};
