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
import { ProjectBidResponseData } from "./data";
import { projectBidRules } from "./rules";
import { projectBidViews } from "./views";
import { projectBidColumns } from "./columns";
import { projectBidConfig } from "./config";

export default class ProjectBidRepository extends BaseRepository {
  public fillables: Array<keyof ProjectBidResponseData> =
    projectBidConfig.fillables;
  public rules: { [key: string]: string } = projectBidRules;
  public views: ViewsProps[] = projectBidViews;
  protected state: ProjectBidResponseData = projectBidConfig.state;
  public columns: ColumnData[] = projectBidColumns;
  public actions: ButtonsProp[] = projectBidConfig.actions;

  public fromJson(data: JsonResponse): ProjectBidResponseData {
    return {
      id: data.id ?? 0,
      project_id: data.project_id ?? 0,
      bid_invitation_id: data.bid_invitation_id ?? 0,
      vendor_id: data.vendor_id ?? 0,
      bid_reference: data.bid_reference ?? "",
      bid_amount: data.bid_amount ?? 0,
      bid_currency: data.bid_currency ?? "NGN",
      submitted_at: data.submitted_at ?? null,
      submission_method: data.submission_method ?? "physical",
      received_by: data.received_by ?? null,
      bid_security_submitted: data.bid_security_submitted ?? false,
      bid_security_type: data.bid_security_type ?? null,
      bid_security_reference: data.bid_security_reference ?? null,
      opened_at: data.opened_at ?? null,
      opened_by: data.opened_by ?? null,
      is_administratively_compliant: data.is_administratively_compliant ?? null,
      administrative_notes: data.administrative_notes ?? null,
      technical_score: data.technical_score ?? null,
      technical_status: data.technical_status ?? null,
      technical_notes: data.technical_notes ?? null,
      financial_score: data.financial_score ?? null,
      is_financially_responsive: data.is_financially_responsive ?? null,
      financial_notes: data.financial_notes ?? null,
      combined_score: data.combined_score ?? null,
      ranking: data.ranking ?? null,
      status: data.status ?? "submitted",
      disqualification_reason: data.disqualification_reason ?? null,
      bid_documents: data.bid_documents ?? null,
      vendor: data.vendor ?? undefined,
      project: data.project ?? undefined,
      bid_invitation: data.bid_invitation ?? undefined,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      deleted_at: data.deleted_at ?? null,
    };
  }

  public associatedResources: DependencyProps[] =
    projectBidConfig.associatedResources;
}

