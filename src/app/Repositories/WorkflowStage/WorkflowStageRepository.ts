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
import { WorkflowStageResponseData } from "./data";
import { workflowStageRules } from "./rules";
import { workflowStageViews } from "./views";
import { workflowStageColumns } from "./columns";
import { workflowStageConfig } from "./config";
import { formatOptions } from "app/Support/Helpers";

export default class WorkflowStageRepository extends BaseRepository {
  public fillables: Array<keyof WorkflowStageResponseData> =
    workflowStageConfig.fillables;
  public rules: { [key: string]: string } = workflowStageRules;
  public views: ViewsProps[] = workflowStageViews;
  protected state: WorkflowStageResponseData = workflowStageConfig.state;
  public columns: ColumnData[] = workflowStageColumns;
  public actions: ButtonsProp[] = workflowStageConfig.actions;
  public fromJson(data: WorkflowStageResponseData): WorkflowStageResponseData {
    return {
      id: data.id ?? 0,
      workflow_stage_category_id: data.workflow_stage_category_id ?? 0,
      department_id: data.department_id ?? 0,
      fallback_stage_id: data.fallback_stage_id ?? 0,
      name: data.name ?? "",
      category: data.category ?? "system",
      stage_category: data.stage_category ?? null,
      can_appeal: data.can_appeal ?? 0,
      append_signature: data.append_signature ?? 0,
      document_actions: [],
      groups: formatOptions(data.groups, "id", "name") ?? [],
      recipients: formatOptions(data.recipients, "id", "name") ?? [],
      actions: formatOptions(data.actions, "id", "name") ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    workflowStageConfig.associatedResources;
}
