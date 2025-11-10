export const inventoryAdjustmentRules: { [key: string]: string } = {
  location_id: "required|numeric",
  reason: "required|string",
  notes: "nullable|string",
  adjusted_at: "nullable|string",
  lines: "required|array",
};
