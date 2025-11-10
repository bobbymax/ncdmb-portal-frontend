import { ColumnData } from "resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  JsonResponse,
  ViewsProps,
} from "../BaseRepository";
import { InventoryIssueResponseData } from "./data";
import { inventoryIssueConfig } from "./config";
import { inventoryIssueColumns } from "./columns";
import { inventoryIssueRules } from "./rules";
import { inventoryIssueViews } from "./views";

export default class InventoryIssueRepository extends BaseRepository {
  public fillables: Array<keyof InventoryIssueResponseData> =
    inventoryIssueConfig.fillables;
  public rules: { [key: string]: string } = inventoryIssueRules;
  public views: ViewsProps[] = inventoryIssueViews;
  protected state: InventoryIssueResponseData = inventoryIssueConfig.state;
  public columns: ColumnData[] = inventoryIssueColumns;
  public actions = inventoryIssueConfig.actions;
  public associatedResources = inventoryIssueConfig.associatedResources;

  public fromJson(data: JsonResponse): InventoryIssueResponseData {
    return {
      id: data.id ?? 0,
      requisition_id: data.requisition_id ?? 0,
      issued_by: data.issued_by ?? 0,
      issued_to: data.issued_to ?? null,
      from_location_id: data.from_location_id ?? 0,
      reference: data.reference ?? "",
      issued_at: data.issued_at ?? "",
      remarks: data.remarks ?? "",
      items: (data.items ?? []).map((item: any) => ({
        requisition_item_id: item.requisition_item_id ?? 0,
        product_id: item.product_id ?? 0,
        product_name: item.product?.name ?? "",
        product_measurement_id: item.product_measurement_id ?? null,
        measurement_label:
          item.measurement?.name ??
          item.product_measurement?.measurement?.name ??
          "",
        quantity: Number(item.quantity_issued ?? item.quantity ?? 0),
        unit_cost: item.unit_cost ?? null,
        batch_id: item.batch_id ?? null,
      })),
      requisition: data.requisition ?? null,
      location: data.location ?? null,
      transactions: data.transactions ?? [],
      requisition_code: data.requisition?.code ?? "—",
      issued_to_name: data.issued_to_user?.name ?? data.issued_to_user?.full_name ?? "—",
      location_name: data.location?.name ?? "—",
      items_count: Array.isArray(data.items) ? data.items.length : 0,
      issued_at_display: data.issued_at
        ? new Date(data.issued_at).toLocaleString()
        : "—",
    } as InventoryIssueResponseData & {
      requisition_code: string;
      issued_to_name: string;
      location_name: string;
      items_count: number;
      issued_at_display: string;
    };
  }
}
