import { ColumnData } from "resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  JsonResponse,
  ViewsProps,
} from "../BaseRepository";
import { InventoryTransactionResponseData } from "./data";
import { inventoryTransactionConfig } from "./config";
import { inventoryTransactionColumns } from "./columns";
import { inventoryTransactionRules } from "./rules";
import { inventoryTransactionViews } from "./views";

export default class InventoryTransactionRepository extends BaseRepository {
  public fillables: Array<keyof InventoryTransactionResponseData> =
    inventoryTransactionConfig.fillables;
  public rules: { [key: string]: string } = inventoryTransactionRules;
  public views: ViewsProps[] = inventoryTransactionViews;
  protected state: InventoryTransactionResponseData =
    inventoryTransactionConfig.state;
  public columns: ColumnData[] = inventoryTransactionColumns;
  public actions = inventoryTransactionConfig.actions;
  public associatedResources = inventoryTransactionConfig.associatedResources;

  public fromJson(data: JsonResponse): InventoryTransactionResponseData {
    return {
      id: data.id ?? 0,
      product_id: data.product_id ?? 0,
      product_measurement_id: data.product_measurement_id ?? null,
      location_id: data.location_id ?? 0,
      type: data.type ?? "receipt",
      quantity: Number(data.quantity ?? 0),
      unit_cost: data.unit_cost !== null ? Number(data.unit_cost) : null,
      value: data.value !== null ? Number(data.value) : null,
      project_contract_id: data.project_contract_id ?? null,
      store_supply_id: data.store_supply_id ?? null,
      inventory_issue_id: data.inventory_issue_id ?? null,
      inventory_return_id: data.inventory_return_id ?? null,
      inventory_adjustment_id: data.inventory_adjustment_id ?? null,
      performed_by: data.performed_by ?? null,
      transacted_at: data.transacted_at
        ? new Date(data.transacted_at).toLocaleString()
        : null,
      meta: data.meta ?? null,
      product: data.product ?? null,
      measurement: data.measurement ?? null,
      location: data.location ?? null,
      actor: data.performed_by_user ?? data.actor ?? null,
      product_name: data.product?.name ?? "—",
      measurement_label:
        data.measurement?.name ??
        data.product_measurement?.measurement?.name ??
        "—",
      location_name: data.location?.name ?? "—",
      actor_name:
        data.performed_by_user?.name ??
        data.actor?.name ??
        data.actor?.full_name ??
        "—",
    } as InventoryTransactionResponseData;
  }
}
