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
import { ProjectBidInvitationResponseData } from "./data";
import { projectBidInvitationRules } from "./rules";
import { projectBidInvitationViews } from "./views";
import { projectBidInvitationColumns } from "./columns";
import { projectBidInvitationConfig } from "./config";

export default class ProjectBidInvitationRepository extends BaseRepository {
  public fillables: Array<keyof ProjectBidInvitationResponseData> =
    projectBidInvitationConfig.fillables;
  public rules: { [key: string]: string } = projectBidInvitationRules;
  public views: ViewsProps[] = projectBidInvitationViews;
  protected state: ProjectBidInvitationResponseData = projectBidInvitationConfig.state;
  public columns: ColumnData[] = projectBidInvitationColumns;
  public actions: ButtonsProp[] = projectBidInvitationConfig.actions;

  public fromJson(data: JsonResponse): ProjectBidInvitationResponseData {
    return {
      id: data.id ?? 0,
      project_id: data.project_id ?? 0,
      invitation_reference: data.invitation_reference ?? "",
      title: data.title ?? "",
      description: data.description ?? null,
      technical_specifications: data.technical_specifications ?? null,
      scope_of_work: data.scope_of_work ?? null,
      deliverables: data.deliverables ?? null,
      terms_and_conditions: data.terms_and_conditions ?? null,
      required_documents: data.required_documents ?? null,
      eligibility_criteria: data.eligibility_criteria ?? null,
      bid_security_required: data.bid_security_required ?? true,
      bid_security_amount: data.bid_security_amount ?? null,
      bid_security_validity_days: data.bid_security_validity_days ?? 90,
      estimated_contract_value: data.estimated_contract_value ?? null,
      advertisement_date: data.advertisement_date ?? null,
      pre_bid_meeting_date: data.pre_bid_meeting_date ?? null,
      pre_bid_meeting_location: data.pre_bid_meeting_location ?? null,
      submission_deadline: data.submission_deadline ?? "",
      bid_validity_days: data.bid_validity_days ?? 90,
      opening_date: data.opening_date ?? "",
      opening_location: data.opening_location ?? null,
      evaluation_criteria: data.evaluation_criteria ?? null,
      technical_weight: data.technical_weight ?? 70,
      financial_weight: data.financial_weight ?? 30,
      published_newspapers: data.published_newspapers ?? null,
      published_bpp_portal: data.published_bpp_portal ?? false,
      tender_document_url: data.tender_document_url ?? null,
      bill_of_quantities_url: data.bill_of_quantities_url ?? null,
      status: data.status ?? "draft",
      project: data.project ?? undefined,
      bids: data.bids ?? undefined,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }

  public associatedResources: DependencyProps[] =
    projectBidInvitationConfig.associatedResources;
}

