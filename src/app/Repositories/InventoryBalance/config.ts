import { ConfigProp } from "../BaseRepository";
import { InventoryBalanceResponseData } from "./data";

export const inventoryBalanceConfig: ConfigProp<InventoryBalanceResponseData> = {
  fillables: [],
  associatedResources: [],
  state: {
    id: 0,
    product_id: 0,
    product_measurement_id: null,
    location_id: 0,
    on_hand: 0,
    reserved: 0,
    available: 0,
    unit_cost: 0,
  },
  actions: [],
};
