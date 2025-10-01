import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { SettingResponseData } from "./data";
import { settingRules } from "./rules";
import { settingViews } from "./views";
import { settingColumns } from "./columns";
import { settingConfig } from "./config";

export default class SettingRepository extends BaseRepository {
  public fillables: Array<keyof SettingResponseData> = settingConfig.fillables;
  public rules: { [key: string]: string } = settingRules;
  public views: ViewsProps[] = settingViews;
  protected state: SettingResponseData = settingConfig.state;
  public columns: ColumnData[] = settingColumns;
  public actions: ButtonsProp[] = settingConfig.actions;
  public fromJson(data: SettingResponseData): SettingResponseData {
    return {
      id: data.id ?? 0,
      key: data.key ?? "",
      name: data.name ?? "",
      value: data.value ?? "",
      details: data.details ?? "",
      input_type: data.input_type ?? "",
      input_data_type: data.input_data_type ?? "",
      access_group: data.access_group ?? "public",
      order: data.order ?? 0,
      is_disabled: data.is_disabled ?? 0,
      configuration: data.configuration ?? {},
      layout: data.layout ?? 12,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    settingConfig.associatedResources;
}
