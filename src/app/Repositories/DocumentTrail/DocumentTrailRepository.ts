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
import { DocumentTrailResponseData } from "./data";
import { documentTrailRules } from "./rules";
import { documentTrailViews } from "./views";
import { documentTrailColumns } from "./columns";
import { documentTrailConfig } from "./config";

export default class DocumentTrailRepository extends BaseRepository {
  public fillables: Array<keyof DocumentTrailResponseData> =
    documentTrailConfig.fillables;
  public rules: { [key: string]: string } = documentTrailRules;
  public views: ViewsProps[] = documentTrailViews;
  protected state: DocumentTrailResponseData = documentTrailConfig.state;
  public columns: ColumnData[] = documentTrailColumns;
  public actions: ButtonsProp[] = documentTrailConfig.actions;
  public fromJson(data: JsonResponse): DocumentTrailResponseData {
    return {
      id: data.id ?? 0,
      document_id: data.document_id ?? 0,
      document_draft_id: data.document_draft_id ?? 0,
      document_action_id: data.document_action_id ?? 0,
      document_trailable_id: data.document_trailable_id ?? 0,
      document_trailable_type: data.document_trailable_type ?? "",
      user_id: data.user_id ?? 0,
      reason: data.reason ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    documentTrailConfig.associatedResources;
}
