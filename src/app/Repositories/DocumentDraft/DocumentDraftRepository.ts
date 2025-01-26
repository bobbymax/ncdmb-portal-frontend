import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
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
  public fromJson(data: DocumentDraftResponseData): DocumentDraftResponseData {
    return {
      id: data.id ?? 0,
      document_id: data.document_id ?? 0,
      group_id: data.group_id ?? 0,
      progress_tracker_id: data.progress_tracker_id ?? 0,
      created_by_user_id: data.created_by_user_id ?? 0,
      current_workflow_stage_id: data.current_workflow_stage_id ?? 0,
      department_id: data.department_id ?? 0,
      authorising_staff_id: data.authorising_staff_id ?? 0,
      document_draftable_id: data.document_draftable_id ?? 0,
      document_draftable_type: data.document_draftable_type ?? "",
      file_path: data.file_path ?? "",
      digital_signature_path: data.digital_signature_path ?? "",
      signature: data.signature ?? "",
      status: data.status ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentDraftConfig.associatedResources;
}
