import { DataOptionsProps } from "@/resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { InvoiceResponseData } from "../Invoice/data";
import { MilestoneResponseData } from "../Milestone/data";
import type { ProjectProgramResponseData } from "../ProjectProgram/data";

export type ResourceFoundation = "staff" | "third-party";

export type ProjectType =
  | "capital"
  | "operational"
  | "maintenance"
  | "research"
  | "infrastructure";
export type ProjectPriority = "critical" | "high" | "medium" | "low";
export type LifecycleStage =
  | "concept"
  | "feasibility"
  | "design"
  | "procurement"
  | "award"
  | "mobilization"
  | "execution"
  | "monitoring"
  | "completion"
  | "handover"
  | "closure"
  | "evaluation";
export type ExecutionStatus =
  | "not-started"
  | "in-progress"
  | "suspended"
  | "completed"
  | "terminated"
  | "cancelled";
export type OverallHealth = "on-track" | "at-risk" | "critical" | "completed";
export type LandAcquisitionStatus =
  | "not-required"
  | "in-progress"
  | "completed";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export type ProcurementMethod =
  | "open_competitive"
  | "selective"
  | "rfq"
  | "direct"
  | "emergency"
  | "framework";

export type ProcurementType = "goods" | "works" | "services" | "consultancy";

export interface ProjectResponseData extends BaseResponse {
  // Program/Phase fields
  program_id: number | null;
  phase_name: string | null;
  phase_order: number | null;

  // Existing fields
  user_id: number; // handled on server
  department_id: number; // handled on server
  threshold_id: number; // handled on server
  project_category_id: number;
  code: string; // handled on server
  title: string;
  slug?: string; // handled on server
  description: string;
  total_proposed_amount: number;
  total_approved_amount: number; // ignore
  variation_amount: number; // ignore
  sub_total_amount: number;
  vat_amount: number;
  markup_amount: number;
  approved_start_date: string; // ignore
  approved_end_date: string; // ignore
  actual_end_date: string; // ignore
  proposed_start_date: string;
  proposed_end_date: string;
  type: ResourceFoundation;
  service_charge_percentage: number;
  invoice?: InvoiceResponseData | null; // ignore
  status:
    | "pending"
    | "registered"
    | "approved"
    | "denied"
    | "kiv"
    | "discussed"; // ignore
  milestones?: MilestoneResponseData[];

  // New Classification fields
  project_type: ProjectType;
  priority: ProjectPriority;
  strategic_alignment: string;

  // New Organizational Links
  ministry_id: number | null; // ignore
  implementing_agency_id: number | null; // ignore
  sponsoring_department_id: number | null; // ignore
  project_manager_id: number | null; // ignore

  // New Financial Information
  fund_id: number | null;
  budget_year: string;
  budget_head_code: string; // ignore
  total_revised_amount: number; // ignore
  total_actual_cost: number; // ignore
  contingency_amount: number; // ignore
  contingency_percentage: number; // ignore

  // New Lifecycle Stages
  lifecycle_stage: LifecycleStage; // ignore
  execution_status: ExecutionStatus; // ignore
  overall_health: OverallHealth; // ignore

  // Procurement Fields
  procurement_method: ProcurementMethod | null;
  procurement_reference: string | null; // ignore
  procurement_type: ProcurementType | null;
  method_justification: string | null;
  requires_bpp_clearance: boolean; // ignore
  bpp_no_objection_invite: string | null; // ignore
  bpp_no_objection_award: string | null; // ignore
  bpp_invite_date: string | null; // ignore
  bpp_award_date: string | null; // ignore
  advertised_at: string | null; // ignore
  advertisement_reference: string | null; // ignore

  // New Additional Dates
  concept_date: string; // ignore
  approval_date: string; // ignore
  commencement_order_date: string; // ignore
  revised_end_date: string; // ignore
  handover_date: string; // ignore
  warranty_expiry_date: string; // ignore

  // New Progress Metrics
  physical_progress_percentage: number; // ignore
  financial_progress_percentage: number; // ignore
  time_elapsed_percentage: number; // ignore

  // New Compliance & Governance
  has_environmental_clearance: boolean; // ignore
  environmental_clearance_date: string; // ignore
  has_land_acquisition: boolean; // ignore
  land_acquisition_status: LandAcquisitionStatus; // ignore
  requires_public_consultation: boolean; // ignore
  public_consultation_completed: boolean; // ignore

  // New Risk & Issues
  risk_level: RiskLevel; // ignore
  has_active_issues: boolean; // ignore
  issues_count: number; // ignore

  // New Additional Metadata
  is_multi_year: boolean; // ignore
  is_archived: boolean; // ignore
  archived_at: string; // ignore
  archived_by: number | null; // ignore

  // Relationships
  program?: ProjectProgramResponseData | null;
  department_owner?: DataOptionsProps | null;
  fund?: DataOptionsProps | null;

  // Timestamps
  created_at?: string; // handled on server
  updated_at?: string; // handled on server
  deleted_at?: string; // handled on server
}
