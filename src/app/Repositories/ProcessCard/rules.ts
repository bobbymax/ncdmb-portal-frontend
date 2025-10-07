export const processCardRules: { [key: string]: string } = {
  document_type_id: "required|integer",
  ledger_id: "required|integer",
  service: "required|string|max:255",
  name: "required|string|max:255",
  component: "required|string|max:255",
};
