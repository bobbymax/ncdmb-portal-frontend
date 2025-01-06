import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { WorkflowStageResponseData } from "./data";
import { workflowStageRules } from "./rules";
import { workflowStageViews } from "./views";
import { workflowStageColumns } from "./columns";
import { workflowStageConfig } from "./config";

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
      assistant_group_id: data.assistant_group_id ?? 0,
      alert_recipients: data.alert_recipients ?? 0,
      supporting_documents_verified:
        data.supporting_documents_verified ?? false,
      group_id: data.group_id ?? 0,
      department_id: data.department_id ?? 0,
      name: data.name ?? "",
      fallback_stage_id: data.fallback_stage_id ?? 0,
      flag: "passed",
      actions: data.actions ?? [],
      documentsRequired: data.documentsRequired ?? [],
      recipients: data.recipients ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    workflowStageConfig.associatedResources;
}
