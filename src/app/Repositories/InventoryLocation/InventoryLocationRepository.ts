import {
  ColumnData,
} from "resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  JsonResponse,
  ViewsProps,
} from "../BaseRepository";
import { InventoryLocationResponseData } from "./data";
import { inventoryLocationConfig } from "./config";
import { inventoryLocationRules } from "./rules";
import { inventoryLocationViews } from "./views";
import { inventoryLocationColumns } from "./columns";

export default class InventoryLocationRepository extends BaseRepository {
  public fillables: Array<keyof InventoryLocationResponseData> =
    inventoryLocationConfig.fillables;
  public rules: { [key: string]: string } = inventoryLocationRules;
  public views: ViewsProps[] = inventoryLocationViews;
  protected state: InventoryLocationResponseData = inventoryLocationConfig.state;
  public columns: ColumnData[] = inventoryLocationColumns;
  public actions = inventoryLocationConfig.actions;
  public associatedResources = inventoryLocationConfig.associatedResources;

  public fromJson(data: JsonResponse): InventoryLocationResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      code: data.code ?? "",
      type: data.type ?? "warehouse",
      department_id: data.department_id ?? null,
      parent_id: data.parent_id ?? null,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      department: (data.department as { name?: string } | null) ?? null,
      parent: (data.parent as { name?: string } | null) ?? null,
      department_name:
        (data.department as { name?: string } | null)?.name ?? "—",
      parent_name: (data.parent as { name?: string } | null)?.name ?? "—",
      created_at_display: data.created_at
        ? new Date(data.created_at).toLocaleString()
        : "—",
    };
  }
}
