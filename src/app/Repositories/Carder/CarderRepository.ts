import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { CarderResponseData } from "./data";
import { carderRules } from "./rules";
import { carderViews } from "./views";
import { carderColumns } from "./columns";
import { carderConfig } from "./config";

export default class CarderRepository extends BaseRepository {
  public fillables: Array<keyof CarderResponseData> = carderConfig.fillables;
  public rules: { [key: string]: string } = carderRules;
  public views: ViewsProps[] = carderViews;
  protected state: CarderResponseData = carderConfig.state;
  public columns: ColumnData[] = carderColumns;
  public actions: ButtonsProp[] = carderConfig.actions;
  public fromJson(data: CarderResponseData): CarderResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      label: data.label ?? "",
      grade_levels: data.grade_levels ?? [],
      actions: data.actions ?? [],
      groups: data.groups ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    carderConfig.associatedResources;
}
