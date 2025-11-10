import { ConfigProp } from "../BaseRepository";
import { InventoryTransactionResponseData } from "./data";

export const inventoryTransactionConfig: ConfigProp<InventoryTransactionResponseData> = {
  fillables: [],
  associatedResources: [],
  state: {
    id: 0,
    product_id: 0,
    product_measurement_id: null,
    location_id: 0,
    type: "receipt",
    quantity: 0,
    unit_cost: 0,
    value: 0,
    project_contract_id: null,
    store_supply_id: null,
    inventory_issue_id: null,
    inventory_return_id: null,
    inventory_adjustment_id: null,
    performed_by: null,
    transacted_at: null,
  },
  actions: [],
};
