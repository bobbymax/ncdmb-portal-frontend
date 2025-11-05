export const documentCategoryRules: { [key: string]: string } = {
  name: "required|string",
  selectedRequirements: "required|array",
  document_type_id: "required",
  type: "required|string",
  service: "required|string",
  signature_type: "required|string",
};
