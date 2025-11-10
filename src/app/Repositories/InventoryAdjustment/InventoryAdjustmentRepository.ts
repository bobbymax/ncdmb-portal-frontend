import { ColumnData } from "resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  JsonResponse,
  ViewsProps,
} from "../BaseRepository";
import { InventoryAdjustmentResponseData } from "./data";
import { inventoryAdjustmentConfig } from "./config";
import { inventoryAdjustmentColumns } from "./columns";
import { inventoryAdjustmentRules } from "./rules";
import { inventoryAdjustmentViews } from "./views";

export default class InventoryAdjustmentRepository extends BaseRepository {
  public fillables: Array<keyof InventoryAdjustmentResponseData> =
    inventoryAdjustmentConfig.fillables;
  public rules: { [key: string]: string } = inventoryAdjustmentRules;
  public views: ViewsProps[] = inventoryAdjustmentViews;
  protected state: InventoryAdjustmentResponseData = inventoryAdjustmentConfig.state;
  public columns: ColumnData[] = inventoryAdjustmentColumns;
  public actions = inventoryAdjustmentConfig.actions;
  public associatedResources = inventoryAdjustmentConfig.associatedResources;

  public fromJson(data: JsonResponse): InventoryAdjustmentResponseData {
    return {
      id: data.id ?? 0,
      location_id: data.location_id ?? 0,
      performed_by: data.performed_by ?? 0,
      reason: data.reason ?? "cycle_count",
      notes: data.notes ?? "",
      adjusted_at: data.adjusted_at ?? null,
      lines:
        (data.lines ?? []).map((line: any) => ({
          product_id: line.product_id ?? 0,
          product_measurement_id: line.product_measurement_id ?? null,
          quantity: Number(line.quantity ?? 0),
          direction: line.direction ?? "plus",
          unit_cost: line.unit_cost !== null ? Number(line.unit_cost) : null,
          product_name: line.product?.name ?? "—",
          measurement_label:
            line.measurement?.name ??
            line.product_measurement?.measurement?.name ??
            "—",
        })) || [],
      location_name: data.location?.name ?? "—",
      actor_name: data.performed_by_user?.name ?? "—",
      lines_count: Array.isArray(data.lines) ? data.lines.length : 0,
      adjusted_at_display: data.adjusted_at
        ? new Date(data.adjusted_at).toLocaleString()
        : "—",
    } as InventoryAdjustmentResponseData & {
      lines_count: number;
      adjusted_at_display: string;
    };
  }
}
