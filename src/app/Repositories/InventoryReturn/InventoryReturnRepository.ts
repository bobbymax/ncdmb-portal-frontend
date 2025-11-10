import { ColumnData } from "resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  JsonResponse,
  ViewsProps,
} from "../BaseRepository";
import { InventoryReturnResponseData } from "./data";
import { inventoryReturnConfig } from "./config";
import { inventoryReturnColumns } from "./columns";
import { inventoryReturnRules } from "./rules";
import { inventoryReturnViews } from "./views";

export default class InventoryReturnRepository extends BaseRepository {
  public fillables: Array<keyof InventoryReturnResponseData> =
    inventoryReturnConfig.fillables;
  public rules: { [key: string]: string } = inventoryReturnRules;
  public views: ViewsProps[] = inventoryReturnViews;
  protected state: InventoryReturnResponseData = inventoryReturnConfig.state;
  public columns: ColumnData[] = inventoryReturnColumns;
  public actions = inventoryReturnConfig.actions;
  public associatedResources = inventoryReturnConfig.associatedResources;

  public fromJson(data: JsonResponse): InventoryReturnResponseData {
    return {
      id: data.id ?? 0,
      inventory_issue_id: data.inventory_issue_id ?? null,
      store_supply_id: data.store_supply_id ?? null,
      location_id: data.location_id ?? 0,
      type: data.type ?? "internal",
      returned_at: data.returned_at ?? null,
      reason: data.reason ?? "",
      product_id: data.product_id ?? 0,
      product_measurement_id: data.product_measurement_id ?? null,
      quantity: Number(data.quantity ?? 0),
      unit_cost: data.unit_cost !== null ? Number(data.unit_cost) : null,
      product_name: data.product?.name ?? "—",
      measurement_label:
        data.product_measurement?.measurement?.name ?? data.measurement?.name ?? "—",
      location_name: data.location?.name ?? "—",
      reference: data.reference ?? data.code ?? "—",
      processed_by_name: data.processed_by_user?.name ?? "—",
      returned_at_display: data.returned_at
        ? new Date(data.returned_at).toLocaleString()
        : "—",
    } as InventoryReturnResponseData;
  }
}
