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
import { ProjectResponseData } from "./data";
import { projectRules } from "./rules";
import { projectViews } from "./views";
import { projectColumns } from "./columns";
import { projectConfig } from "./config";

export default class ProjectRepository extends BaseRepository {
  public fillables: Array<keyof ProjectResponseData> = projectConfig.fillables;
  public rules: { [key: string]: string } = projectRules;
  public views: ViewsProps[] = projectViews;
  protected state: ProjectResponseData = projectConfig.state;
  public columns: ColumnData[] = projectColumns;
  public actions: ButtonsProp[] = projectConfig.actions;

  public fromJson(data: JsonResponse): ProjectResponseData {
    return {
      // Program/Phase fields
      program_id: data.program_id ?? null,
      phase_name: data.phase_name ?? null,
      phase_order: data.phase_order ?? null,
      
      // Existing fields
      id: data.id ?? 0,
      user_id: data.user_id ?? 0,
      department_id: data.department_id ?? 0,
      threshold_id: data.threshold_id ?? 0,
      project_category_id: data.project_category_id ?? 0,
      code: data.code ?? "",
      title: data.title ?? "",
      description: data.description ?? "",
      service_charge_percentage: data.service_charge_percentage ?? 0,
      total_proposed_amount: data.total_proposed_amount ?? 0,
      total_approved_amount: data.total_approved_amount ?? 0,
      variation_amount: data.variation_amount ?? 0,
      sub_total_amount: data.sub_total_amount ?? 0,
      vat_amount: data.vat_amount ?? 0,
      markup_amount: data.markup_amount ?? 0,
      approved_start_date: data.approved_start_date ?? "",
      approved_end_date: data.approved_end_date ?? "",
      actual_end_date: data.actual_end_date ?? "",
      proposed_start_date: data.proposed_start_date ?? "",
      proposed_end_date: data.proposed_end_date ?? "",
      invoice: data.invoice ?? null,
      type: data.type ?? "third-party",
      status: data.status ?? "pending",
      milestones: data.milestones ?? [],

      // New fields - Classification
      project_type: data.project_type ?? "capital",
      priority: data.priority ?? "medium",
      strategic_alignment: data.strategic_alignment ?? "",

      // New fields - Organizational
      ministry_id: data.ministry_id ?? null,
      implementing_agency_id: data.implementing_agency_id ?? null,
      sponsoring_department_id: data.sponsoring_department_id ?? null,
      project_manager_id: data.project_manager_id ?? null,

      // New fields - Financial
      fund_id: data.fund_id ?? null,
      budget_year: data.budget_year ?? "",
      budget_head_code: data.budget_head_code ?? "",
      total_revised_amount: data.total_revised_amount ?? 0,
      total_actual_cost: data.total_actual_cost ?? 0,
      contingency_amount: data.contingency_amount ?? 0,
      contingency_percentage: data.contingency_percentage ?? 10,

      // New fields - Lifecycle
      lifecycle_stage: data.lifecycle_stage ?? "concept",
      execution_status: data.execution_status ?? "not-started",
      overall_health: data.overall_health ?? "on-track",

      // Procurement fields
      procurement_method: data.procurement_method ?? null,
      procurement_reference: data.procurement_reference ?? null,
      procurement_type: data.procurement_type ?? null,
      method_justification: data.method_justification ?? null,
      requires_bpp_clearance: data.requires_bpp_clearance ?? false,
      bpp_no_objection_invite: data.bpp_no_objection_invite ?? null,
      bpp_no_objection_award: data.bpp_no_objection_award ?? null,
      bpp_invite_date: data.bpp_invite_date ?? null,
      bpp_award_date: data.bpp_award_date ?? null,
      advertised_at: data.advertised_at ?? null,
      advertisement_reference: data.advertisement_reference ?? null,

      // New fields - Additional Dates
      concept_date: data.concept_date ?? "",
      approval_date: data.approval_date ?? "",
      commencement_order_date: data.commencement_order_date ?? "",
      revised_end_date: data.revised_end_date ?? "",
      handover_date: data.handover_date ?? "",
      warranty_expiry_date: data.warranty_expiry_date ?? "",

      // New fields - Progress Metrics
      physical_progress_percentage: data.physical_progress_percentage ?? 0,
      financial_progress_percentage: data.financial_progress_percentage ?? 0,
      time_elapsed_percentage: data.time_elapsed_percentage ?? 0,

      // New fields - Compliance
      has_environmental_clearance: data.has_environmental_clearance ?? false,
      environmental_clearance_date: data.environmental_clearance_date ?? "",
      has_land_acquisition: data.has_land_acquisition ?? false,
      land_acquisition_status: data.land_acquisition_status ?? "not-required",
      requires_public_consultation: data.requires_public_consultation ?? false,
      public_consultation_completed:
        data.public_consultation_completed ?? false,

      // New fields - Risk
      risk_level: data.risk_level ?? "low",
      has_active_issues: data.has_active_issues ?? false,
      issues_count: data.issues_count ?? 0,

      // New fields - Metadata
      is_multi_year: data.is_multi_year ?? false,
      is_archived: data.is_archived ?? false,
      archived_at: data.archived_at ?? "",
      archived_by: data.archived_by ?? null,

      // Relationships
      program: data.program ?? null,

      // Timestamps
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      deleted_at: data.deleted_at ?? "",
    };
  }

  public associatedResources: DependencyProps[] =
    projectConfig.associatedResources;
}
