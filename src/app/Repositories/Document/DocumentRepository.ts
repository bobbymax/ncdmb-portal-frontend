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
  public fromJson(data: JsonResponse): DocumentResponseData {
    // Map numeric status values to string representations
    const mapStatusToString = (status: any): string => {
      if (typeof status === "string") {
        return status;
      }

      // Map numeric status codes to meaningful strings
      const statusMap: Record<number, string> = {
        0: "pending",
        1: "processing",
        2: "completed",
        3: "approved",
        4: "rejected",
        5: "cancelled",
        6: "draft",
        7: "stalled",
        8: "escalated",
      };

      return statusMap[Number(status)] ?? "pending";
    };

    return {
      id: data.id ?? 0,
      document_category_id: data.document_category_id ?? 0,
      document_type_id: data.document_type_id ?? 0,
      document_reference_id: data.document_reference_id ?? 0,
      vendor_id: data.vendor_id ?? 0,
      approved_amount: parseFloat(data.approved_amount) ?? 0,
      workflow_id: data.workflow_id ?? 0,
      documentable_id: data.documentable_id ?? 0,
      documentable_type: data.documentable_type ?? "",
      title: data.title ?? "",
      ref: data.ref ?? "",
      description: data.description ?? "",
      file_path: data.file_path ?? "",
      status: mapStatusToString(data.status),
      document_template: data.document_template ?? "",
      owner: data.owner ?? null,
      workflow: data.workflow ?? null,
      document_type: data.document_type ?? null,
      uploads: data.uploads ?? [],
      drafts: data.drafts ?? [],
      updates: data.updates ?? [],
      progress_tracker_id: data.progress_tracker_id,
      complete_or_linked_drafts: data.complete_or_linked_drafts ?? [],
      linked_drafts: data.linked_drafts ?? [],
      action: data.action ?? null,
      is_archived: data.is_archived ?? 0,
      dept: data.dept ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      meta_data: data.meta_data ?? null,
      uploaded_requirements: data.uploaded_requirements ?? [],
      preferences: data.preferences ?? null,
      pointer: data.pointer ?? "",
      threads: data.threads ?? [],
      watchers: data.watchers ?? [],
      contents: data.contents ?? [],
      config: data.config ?? null,
      created_by: data.created_by ?? 0,
      is_completed: data.is_completed ?? false,
    };
  }
  public associatedResources: DependencyProps[] =
    documentConfig.associatedResources;
}
