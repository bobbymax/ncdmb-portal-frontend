import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { SignatureResponseData } from "./data";
import { signatureRules } from "./rules";
import { signatureViews } from "./views";
import { signatureColumns } from "./columns";
import { signatureConfig } from "./config";

export default class SignatureRepository extends BaseRepository {
  public fillables: Array<keyof SignatureResponseData> =
    signatureConfig.fillables;
  public rules: { [key: string]: string } = signatureRules;
  public views: ViewsProps[] = signatureViews;
  protected state: SignatureResponseData = signatureConfig.state;
  public columns: ColumnData[] = signatureColumns;
  public actions: ButtonsProp[] = signatureConfig.actions;
  public fromJson(data: SignatureResponseData): SignatureResponseData {
    return {
      id: data.id ?? 0,
      signatory_id: data.signatory_id ?? 0,
      user_id: data.user_id ?? 0,
      document_draft_id: data.document_draft_id ?? 0,
      signature: data.signature ?? "",
      type: data.type ?? "",
      approving_officer: data.approving_officer ?? null,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      flow_type: data.flow_type ?? "from",
    };
  }
  public associatedResources: DependencyProps[] =
    signatureConfig.associatedResources;
}
