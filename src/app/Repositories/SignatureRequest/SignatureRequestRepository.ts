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
import { SignatureRequestResponseData } from "./data";
import { signatureRequestRules } from "./rules";
import { signatureRequestViews } from "./views";
import { signatureRequestColumns } from "./columns";
import { signatureRequestConfig } from "./config";

export default class SignatureRequestRepository extends BaseRepository {
  public fillables: Array<keyof SignatureRequestResponseData> =
    signatureRequestConfig.fillables;
  public rules: { [key: string]: string } = signatureRequestRules;
  public views: ViewsProps[] = signatureRequestViews;
  protected state: SignatureRequestResponseData = signatureRequestConfig.state;
  public columns: ColumnData[] = signatureRequestColumns;
  public actions: ButtonsProp[] = signatureRequestConfig.actions;
  public fromJson(data: JsonResponse): SignatureRequestResponseData {
    return {
      id: data.id ?? 0,
      user_id: data.user_id ?? 0,
      document_id: data.document_id ?? 0,
      document_draft_id: data.document_draft_id ?? 0,
      department_id: data.department_id ?? 0,
      group_id: data.group_id ?? 0,
      status: data.status ?? "pending",
      authorising_officer: data.authorising_officer,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    signatureRequestConfig.associatedResources;
}
