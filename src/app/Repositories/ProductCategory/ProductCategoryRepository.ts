import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { ProductCategoryResponseData } from "./data";
import { productCategoryRules } from "./rules";
import { productCategoryViews } from "./views";
import { productCategoryColumns } from "./columns";
import { productCategoryConfig } from "./config";

export default class ProductCategoryRepository extends BaseRepository {
  public fillables: Array<keyof ProductCategoryResponseData> =
    productCategoryConfig.fillables;
  public rules: { [key: string]: string } = productCategoryRules;
  public views: ViewsProps[] = productCategoryViews;
  protected state: ProductCategoryResponseData = productCategoryConfig.state;
  public columns: ColumnData[] = productCategoryColumns;
  public actions: ButtonsProp[] = productCategoryConfig.actions;
  public fromJson(
    data: ProductCategoryResponseData
  ): ProductCategoryResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      label: data.label ?? "",
      description: data.description ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    productCategoryConfig.associatedResources;
}
