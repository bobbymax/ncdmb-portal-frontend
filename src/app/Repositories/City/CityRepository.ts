import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { CityResponseData } from "./data";
import { cityRules } from "./rules";
import { cityViews } from "./views";
import { cityColumns } from "./columns";
import { cityConfig } from "./config";

export default class CityRepository extends BaseRepository {
  public fillables: Array<keyof CityResponseData> = cityConfig.fillables;
  public rules: { [key: string]: string } = cityRules;
  public views: ViewsProps[] = cityViews;
  protected state: CityResponseData = cityConfig.state;
  public columns: ColumnData[] = cityColumns;
  public actions: ButtonsProp[] = cityConfig.actions;
  public fromJson(data: CityResponseData): CityResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      allowance_id: data.allowance_id ?? 0,
      is_capital: data.is_capital ?? 0,
      has_airport: data.has_airport ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    cityConfig.associatedResources;
}
