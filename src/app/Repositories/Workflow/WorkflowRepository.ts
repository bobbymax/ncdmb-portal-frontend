import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { WorkflowResponseData } from "./data";
import { workflowRules } from "./rules";
import { workflowViews } from "./views";
import { workflowColumns } from "./columns";
import { workflowConfig } from "./config";

export default class WorkflowRepository extends BaseRepository {
  public fillables: Array<keyof WorkflowResponseData> =
    workflowConfig.fillables;
  public rules: { [key: string]: string } = workflowRules;
  public views: ViewsProps[] = workflowViews;
  protected state: WorkflowResponseData = workflowConfig.state;
  public columns: ColumnData[] = workflowColumns;
  public actions: ButtonsProp[] = workflowConfig.actions;
  public fromJson(data: WorkflowResponseData): WorkflowResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      description: data.description ?? "",
      document_type_id: data.document_type_id ?? 0,
      type: data.type ?? "serialize",
      stages: data.stages ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    workflowConfig.associatedResources;
}
