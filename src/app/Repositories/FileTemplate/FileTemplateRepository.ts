import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { FileTemplateResponseData } from "./data";
import { fileTemplateRules } from "./rules";
import { fileTemplateViews } from "./views";
import { fileTemplateColumns } from "./columns";
import { fileTemplateConfig } from "./config";

export default class FileTemplateRepository extends BaseRepository {
  public fillables: Array<keyof FileTemplateResponseData> =
    fileTemplateConfig.fillables;
  public rules: { [key: string]: string } = fileTemplateRules;
  public views: ViewsProps[] = fileTemplateViews;
  protected state: FileTemplateResponseData = fileTemplateConfig.state;
  public columns: ColumnData[] = fileTemplateColumns;
  public actions: ButtonsProp[] = fileTemplateConfig.actions;
  public fromJson(data: FileTemplateResponseData): FileTemplateResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      service: data.service ?? "",
      component: data.component ?? "",
      tagline: data.tagline ?? "",
      repository: data.repository ?? "",
      response_data_format: data.response_data_format ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    fileTemplateConfig.associatedResources;
}
