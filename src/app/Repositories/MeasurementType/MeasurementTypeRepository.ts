import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { MeasurementTypeResponseData } from "./data";
import { measurementTypeRules } from "./rules";
import { measurementTypeViews } from "./views";
import { measurementTypeColumns } from "./columns";
import { measurementTypeConfig } from "./config";

export default class MeasurementTypeRepository extends BaseRepository {
  public fillables: Array<keyof MeasurementTypeResponseData> =
    measurementTypeConfig.fillables;
  public rules: { [key: string]: string } = measurementTypeRules;
  public views: ViewsProps[] = measurementTypeViews;
  protected state: MeasurementTypeResponseData = measurementTypeConfig.state;
  public columns: ColumnData[] = measurementTypeColumns;
  public actions: ButtonsProp[] = measurementTypeConfig.actions;
  public fromJson(
    data: MeasurementTypeResponseData
  ): MeasurementTypeResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      label: data.label ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    measurementTypeConfig.associatedResources;
}
