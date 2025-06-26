import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  DependencyProps,
  JsonResponse,
  ViewsProps,
} from "../BaseRepository";
import { ResourceEditorResponseData } from "./data";
import { resourceEditorRules } from "./rules";
import { resourceEditorViews } from "./views";
import { resourceEditorColumns } from "./columns";
import { resourceEditorConfig } from "./config";

export default class ResourceEditorRepository extends BaseRepository {
  public fillables: Array<keyof ResourceEditorResponseData> =
    resourceEditorConfig.fillables;
  public rules: { [key: string]: string } = resourceEditorRules;
  public views: ViewsProps[] = resourceEditorViews;
  protected state: ResourceEditorResponseData = resourceEditorConfig.state;
  public columns: ColumnData[] = resourceEditorColumns;
  public actions: ButtonsProp[] = resourceEditorConfig.actions;
  public fromJson(data: JsonResponse): ResourceEditorResponseData {
    return {
      id: data.id ?? 0,
      group_id: data.group_id ?? 0,
      workflow_id: data.workflow_id ?? 0,
      workflow_stage_id: data.workflow_stage_id ?? 0,
      service_name: data.service_name ?? "",
      resource_column_name: data.resource_column_name ?? "",
      permission: data.permission ?? "rw",
      service_update: data.service_update ?? "d",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    resourceEditorConfig.associatedResources;
}
