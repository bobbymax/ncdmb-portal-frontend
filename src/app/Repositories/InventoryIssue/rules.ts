export const inventoryIssueRules: { [key: string]: string } = {
  requisition_id: "required|numeric",
  issued_to: "nullable|numeric",
  from_location_id: "required|numeric",
  issued_at: "nullable|string",
  remarks: "sometimes|string",
  items: "required|array",
};
