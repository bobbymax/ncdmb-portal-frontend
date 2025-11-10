import { ColumnData } from "resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  JsonResponse,
  ViewsProps,
} from "../BaseRepository";
import { InventoryBalanceResponseData } from "./data";
import { inventoryBalanceConfig } from "./config";
import { inventoryBalanceColumns } from "./columns";
import { inventoryBalanceViews } from "./views";
import { inventoryBalanceRules } from "./rules";

export default class InventoryBalanceRepository extends BaseRepository {
  public fillables: Array<keyof InventoryBalanceResponseData> =
    inventoryBalanceConfig.fillables;
  public rules: { [key: string]: string } = inventoryBalanceRules;
  public views: ViewsProps[] = inventoryBalanceViews;
  protected state: InventoryBalanceResponseData = inventoryBalanceConfig.state;
  public columns: ColumnData[] = inventoryBalanceColumns;
  public actions = inventoryBalanceConfig.actions;
  public associatedResources = inventoryBalanceConfig.associatedResources;

  public fromJson(data: JsonResponse): InventoryBalanceResponseData {
    return {
      id: data.id ?? 0,
      product_id: data.product_id ?? 0,
      product_measurement_id: data.product_measurement_id ?? null,
      location_id: data.location_id ?? 0,
      on_hand: Number(data.on_hand ?? 0),
      reserved: Number(data.reserved ?? 0),
      available: Number(data.available ?? 0),
      unit_cost: Number(data.unit_cost ?? 0),
      last_movement_at: data.last_movement_at ?? null,
      product: data.product ?? null,
      measurement: data.measurement ?? null,
      location: data.location ?? null,
      product_name: data.product?.name ?? "—",
      measurement_label: data.measurement?.measurement?.name ?? data.product_measurement?.measurement?.name ?? "—",
      location_name: data.location?.name ?? "—",
      last_movement:
        data.last_movement_at
          ? new Date(data.last_movement_at).toLocaleString()
          : "—",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    } as InventoryBalanceResponseData & {
      product_name: string;
      measurement_label: string;
      location_name: string;
      last_movement: string;
    };
  }
}
