import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { ProductStockResponseData } from "./data";
import { productStockRules } from "./rules";
import { productStockViews } from "./views";
import { productStockColumns } from "./columns";
import { productStockConfig } from "./config";

export default class ProductStockRepository extends BaseRepository {
  public fillables: Array<keyof ProductStockResponseData> =
    productStockConfig.fillables;
  public rules: { [key: string]: string } = productStockRules;
  public views: ViewsProps[] = productStockViews;
  protected state: ProductStockResponseData = productStockConfig.state;
  public columns: ColumnData[] = productStockColumns;
  public actions: ButtonsProp[] = productStockConfig.actions;
  public fromJson(data: ProductStockResponseData): ProductStockResponseData {
    return {
      id: data.id ?? 0,
      product_id: data.product_id ?? 0,
      opening_stock_balance: data.opening_stock_balance ?? 0,
      closing_stock_balance: data.closing_stock_balance ?? 0,
      out_of_stock: data.out_of_stock ?? false,
      store_supply_id: data.store_supply_id ?? 0,
      end_of_life: data.end_of_life ?? "",
      stock_in: data.stock_in ?? "purchase",
      stock_out: data.stock_out ?? "sales",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      is_active: data.is_active ?? false,
    };
  }
  public associatedResources: DependencyProps[] =
    productStockConfig.associatedResources;
}
