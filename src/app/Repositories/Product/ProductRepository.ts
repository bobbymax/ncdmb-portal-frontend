import { ColumnData } from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, JsonResponse, ViewsProps } from "../BaseRepository";
import { ProductResponseData } from "./data";
import { productConfig } from "./config";
import { productColumns } from "./columns";
import { productRules } from "./rules";
import { productViews } from "./views";

export default class ProductRepository extends BaseRepository {
  public fillables: Array<keyof ProductResponseData> = productConfig.fillables;
  public rules: { [key: string]: string } = productRules;
  public views: ViewsProps[] = productViews;
  protected state: ProductResponseData = productConfig.state;
  public columns: ColumnData[] = productColumns;
  public actions = productConfig.actions;
  public associatedResources = productConfig.associatedResources;

  public fromJson(data: JsonResponse): ProductResponseData {
    return {
      id: data.id ?? 0,
      product_category_id: data.product_category_id ?? null,
      department_id: data.department_id ?? null,
      product_brand_id: data.product_brand_id ?? null,
      primary_vendor_id: data.primary_vendor_id ?? null,
      name: data.name ?? "",
      label: data.label ?? "",
      code: data.code ?? "",
      description: data.description ?? "",
      restock_qty: Number(data.restock_qty ?? 0),
      reorder_point: Number(data.reorder_point ?? 0),
      max_stock_level: Number(data.max_stock_level ?? 0),
      track_batches: Boolean(data.track_batches),
      owner: (data.owner as "store" | "other") ?? "store",
      request_on_delivery: Boolean(data.request_on_delivery),
      out_of_stock: Boolean(data.out_of_stock),
      is_blocked: Boolean(data.is_blocked),
      measurements: data.measurements ?? [],
      stocks: data.stocks ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      category: data.category ?? null,
      brand: data.brand ?? null,
      department: data.department ?? null,
    };
  }
}
