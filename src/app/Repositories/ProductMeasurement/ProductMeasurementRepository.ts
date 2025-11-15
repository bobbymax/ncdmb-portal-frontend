import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { ProductMeasurementResponseData } from "./data";
import { productMeasurementRules } from "./rules";
import { productMeasurementViews } from "./views";
import { productMeasurementColumns } from "./columns";
import { productMeasurementConfig } from "./config";

export default class ProductMeasurementRepository extends BaseRepository {
  public fillables: Array<keyof ProductMeasurementResponseData> =
    productMeasurementConfig.fillables;
  public rules: { [key: string]: string } = productMeasurementRules;
  public views: ViewsProps[] = productMeasurementViews;
  protected state: ProductMeasurementResponseData =
    productMeasurementConfig.state;
  public columns: ColumnData[] = productMeasurementColumns;
  public actions: ButtonsProp[] = productMeasurementConfig.actions;
  public fromJson(
    data: ProductMeasurementResponseData
  ): ProductMeasurementResponseData {
    return {
      id: data.id ?? 0,
      product_id: data.product_id ?? 0,
      measurement_type_id: data.measurement_type_id ?? 0,
      quantity: data.quantity ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    productMeasurementConfig.associatedResources;
}
