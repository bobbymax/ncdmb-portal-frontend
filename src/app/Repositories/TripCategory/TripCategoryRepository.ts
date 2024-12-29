import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { TripCategoryResponseData } from "./data";
import { tripCategoryRules } from "./rules";
import { tripCategoryViews } from "./views";
import { tripCategoryColumns } from "./columns";
import { tripCategoryConfig } from "./config";
import { formatOptions } from "app/Support/Helpers";

export default class TripCategoryRepository extends BaseRepository {
  public fillables: Array<keyof TripCategoryResponseData> =
    tripCategoryConfig.fillables;
  public rules: { [key: string]: string } = tripCategoryRules;
  public views: ViewsProps[] = tripCategoryViews;
  protected state: TripCategoryResponseData = tripCategoryConfig.state;
  public columns: ColumnData[] = tripCategoryColumns;
  public actions: ButtonsProp[] = tripCategoryConfig.actions;
  public fromJson(data: TripCategoryResponseData): TripCategoryResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      label: data.label ?? "",
      description: data.description ?? "",
      accommodation_type: data.accommodation_type ?? "non-residence",
      type: data.type ?? "flight",
      allowances: data.allowances ?? [],
      selectedAllowances: formatOptions(data.allowances, "id", "name") ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    tripCategoryConfig.associatedResources;
}
