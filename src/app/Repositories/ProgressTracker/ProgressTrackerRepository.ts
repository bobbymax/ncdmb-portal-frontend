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
import { ProgressTrackerResponseData } from "./data";
import { progressTrackerRules } from "./rules";
import { progressTrackerViews } from "./views";
import { progressTrackerColumns } from "./columns";
import { progressTrackerConfig } from "./config";
import { formatOptions } from "app/Support/Helpers";

export default class ProgressTrackerRepository extends BaseRepository {
  public fillables: Array<keyof ProgressTrackerResponseData> =
    progressTrackerConfig.fillables;
  public rules: { [key: string]: string } = progressTrackerRules;
  public views: ViewsProps[] = progressTrackerViews;
  protected state: ProgressTrackerResponseData = progressTrackerConfig.state;
  public columns: ColumnData[] = progressTrackerColumns;
  public actions: ButtonsProp[] = progressTrackerConfig.actions;
  public fromJson(data: JsonResponse): ProgressTrackerResponseData {
    return {
      id: data.id ?? 0,
      identifier: data.identifier ?? "",
      workflow_id: data.workflow_id ?? 0,
      workflow_stage_id: data.workflow_stage_id ?? 0,
      document_type_id: data.document_type_id ?? 0,
      group_id: data.group_id ?? 0,
      department_id: data.department_id ?? 0,
      carder_id: data.carder_id ?? 0,
      signatory_id: data.signatory_id ?? 0,
      internal_process_id: data.internal_process_id ?? 0,
      permission: data.permission ?? "r",
      stage: data.stage ?? null,
      document_type: data.document_type ?? null,
      carder: data.carder ?? null,
      order: data.order ?? 0,
      group: data.group ?? null,
      actions: formatOptions(data.actions, "id", "button_text") ?? [],
      recipients: formatOptions(data.recipients, "id", "name") ?? [],
      department: data.department ?? null,
      widgets: data.widgets ?? [],
      loadedActions: data.actions ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    progressTrackerConfig.associatedResources;
}
