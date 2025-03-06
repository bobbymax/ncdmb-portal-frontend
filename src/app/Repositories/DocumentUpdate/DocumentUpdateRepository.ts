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
import { DocumentUpdateResponseData } from "./data";
import { documentUpdateRules } from "./rules";
import { documentUpdateViews } from "./views";
import { documentUpdateColumns } from "./columns";
import { documentUpdateConfig } from "./config";

export default class DocumentUpdateRepository extends BaseRepository {
  public fillables: Array<keyof DocumentUpdateResponseData> =
    documentUpdateConfig.fillables;
  public rules: { [key: string]: string } = documentUpdateRules;
  public views: ViewsProps[] = documentUpdateViews;
  protected state: DocumentUpdateResponseData = documentUpdateConfig.state;
  public columns: ColumnData[] = documentUpdateColumns;
  public actions: ButtonsProp[] = documentUpdateConfig.actions;
  public fromJson(data: JsonResponse): DocumentUpdateResponseData {
    return {
      id: data.id ?? 0,
      document_action_id: data.document_action_id ?? 0,
      document_draft_id: data.document_draft_id ?? 0,
      user_id: data.user_id ?? 0,
      threads: data.threads ?? [],
      comment: data.comment ?? "",
      status: data.status ?? "pending",
      user: data.user,
      meta: data.meta,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentUpdateConfig.associatedResources;
}
