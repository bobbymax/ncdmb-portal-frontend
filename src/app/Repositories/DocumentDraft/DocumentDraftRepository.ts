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
import { DocumentDraftResponseData } from "./data";
import { documentDraftRules } from "./rules";
import { documentDraftViews } from "./views";
import { documentDraftColumns } from "./columns";
import { documentDraftConfig } from "./config";

export default class DocumentDraftRepository extends BaseRepository {
  public fillables: Array<keyof DocumentDraftResponseData> =
    documentDraftConfig.fillables;
  public rules: { [key: string]: string } = documentDraftRules;
  public views: ViewsProps[] = documentDraftViews;
  protected state: DocumentDraftResponseData = documentDraftConfig.state;
  public columns: ColumnData[] = documentDraftColumns;
  public actions: ButtonsProp[] = documentDraftConfig.actions;
  public fromJson(data: JsonResponse): DocumentDraftResponseData {
    return {
      id: data.id ?? 0,
      document_id: data.document_id ?? 0,
      document_action_id: data.document_action_id ?? 0,
      group_id: data.group_id ?? 0,
      progress_tracker_id: data.progress_tracker_id ?? 0,
      current_workflow_stage_id: data.current_workflow_stage_id ?? 0,
      department_id: data.department_id ?? 0,
      operator: data.operator ?? null,
      amount: data.amount ?? "",
      taxable_amount: data.taxable_amount ?? "",
      status: data.status ?? "",
      order: data.order ?? 0,
      ref: data.ref ?? "",
      action: data.action ?? null,
      version_number: data.version_number ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentDraftConfig.associatedResources;
}
