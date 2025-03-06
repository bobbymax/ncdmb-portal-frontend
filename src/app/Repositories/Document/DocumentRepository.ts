import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { DocumentResponseData } from "./data";
import { documentRules } from "./rules";
import { documentViews } from "./views";
import { documentColumns } from "./columns";
import { documentConfig } from "./config";

export default class DocumentRepository extends BaseRepository {
  public fillables: Array<keyof DocumentResponseData> =
    documentConfig.fillables;
  public rules: { [key: string]: string } = documentRules;
  public views: ViewsProps[] = documentViews;
  protected state: DocumentResponseData = documentConfig.state;
  public columns: ColumnData[] = documentColumns;
  public actions: ButtonsProp[] = documentConfig.actions;
  public fromJson(data: DocumentResponseData): DocumentResponseData {
    return {
      id: data.id ?? 0,
      document_category_id: data.document_category_id ?? 0,
      document_type_id: data.document_type_id ?? 0,
      vendor_id: data.vendor_id ?? 0,
      workflow_id: data.workflow_id ?? 0,
      documentable_id: data.documentable_id ?? 0,
      documentable_type: data.documentable_type ?? "",
      title: data.title ?? "",
      ref: data.ref ?? "",
      description: data.description ?? "",
      file_path: data.file_path ?? "",
      status: data.status ?? "pending",
      document_template: data.document_template ?? "",
      owner: data.owner ?? null,
      workflow: data.workflow ?? null,
      document_type: data.document_type ?? null,
      uploads: data.uploads ?? [],
      drafts: data.drafts ?? [],
      documentable: data.documentable,
      updates: data.updates ?? [],
      progress_tracker_id: data.progress_tracker_id,
      is_archived: data.is_archived ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentConfig.associatedResources;
}
