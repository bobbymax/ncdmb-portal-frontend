export const inventoryLocationRules: { [key: string]: string } = {
  name: "required|string",
  code: "required|string",
  type: "required|string",
  department_id: "sometimes|numeric",
  parent_id: "sometimes|numeric",
};
