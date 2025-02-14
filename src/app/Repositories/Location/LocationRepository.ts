import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { LocationResponseData } from "./data";
import { locationRules } from "./rules";
import { locationViews } from "./views";
import { locationColumns } from "./columns";
import { locationConfig } from "./config";

export default class LocationRepository extends BaseRepository {
  public fillables: Array<keyof LocationResponseData> =
    locationConfig.fillables;
  public rules: { [key: string]: string } = locationRules;
  public views: ViewsProps[] = locationViews;
  protected state: LocationResponseData = locationConfig.state;
  public columns: ColumnData[] = locationColumns;
  public actions: ButtonsProp[] = locationConfig.actions;
  public fromJson(data: LocationResponseData): LocationResponseData {
    return {
      id: data.id ?? 0,
      city_id: data.city_id ?? 0,
      name: data.name ?? "",
      is_closed: data.is_closed ?? 0,
      address: data.address ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    locationConfig.associatedResources;
}
