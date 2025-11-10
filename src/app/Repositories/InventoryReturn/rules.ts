export const inventoryReturnRules: { [key: string]: string } = {
  location_id: "required|numeric",
  type: "required|string",
  returned_at: "nullable|string",
  reason: "nullable|string",
  product_id: "required|numeric",
  product_measurement_id: "nullable|numeric",
  quantity: "required|numeric",
  unit_cost: "nullable|numeric",
};
