import { ConfigProp } from "../BaseRepository";
import { ProjectResponseData } from "./data";

export const projectConfig: ConfigProp<ProjectResponseData> = {
  fillables: [
    // Program/Phase fields
    "program_id",
    "phase_name",
    "phase_order",
    
    // Existing fillables
    "user_id",
    "department_id",
    "threshold_id",
    "project_category_id",
    "code",
    "title",
    "description",
    "total_proposed_amount",
    "total_approved_amount",
    "variation_amount",
    "sub_total_amount",
    "vat_amount",
    "markup_amount",
    "proposed_start_date",
    "proposed_end_date",
    "type",
    "status",
    "service_charge_percentage",

    // New fillables - Classification
    "project_type",
    "priority",
    "strategic_alignment",

    // New fillables - Organizational
    "ministry_id",
    "implementing_agency_id",
    "sponsoring_department_id",
    "project_manager_id",

    // New fillables - Financial
    "fund_id",
    "budget_year",
    "budget_head_code",
    "total_revised_amount",
    "total_actual_cost",
    "contingency_amount",
    "contingency_percentage",

    // New fillables - Lifecycle
    "lifecycle_stage",
    "execution_status",
    "overall_health",

    // New fillables - Procurement
    "procurement_method",
    "procurement_type",
    "method_justification",

    // New fillables - Dates
    "concept_date",
    "approval_date",
    "commencement_order_date",
    "approved_start_date",
    "approved_end_date",
    "revised_end_date",
    "actual_end_date",
    "handover_date",
    "warranty_expiry_date",

    // New fillables - Progress
    "physical_progress_percentage",
    "financial_progress_percentage",
    "time_elapsed_percentage",

    // New fillables - Compliance
    "has_environmental_clearance",
    "environmental_clearance_date",
    "has_land_acquisition",
    "land_acquisition_status",
    "requires_public_consultation",
    "public_consultation_completed",

    // New fillables - Risk
    "risk_level",
    "has_active_issues",
    "issues_count",

    // New fillables - Metadata
    "is_multi_year",
    "is_archived",
  ],
  associatedResources: [
    { name: "thresholds", url: "thresholds" },
    { name: "projectCategories", url: "projectCategories" },
    { name: "projectPrograms", url: "projectPrograms" },
    { name: "departments", url: "departments" },
    { name: "users", url: "users" },
    { name: "funds", url: "funds" },
  ],
  state: {
    // Program/Phase fields
    program_id: null,
    phase_name: null,
    phase_order: null,
    
    // Existing state
    id: 0,
    user_id: 0,
    department_id: 0,
    threshold_id: 0,
    project_category_id: 0,
    service_charge_percentage: 0,
    code: "",
    title: "",
    description: "",
    total_proposed_amount: 0,
    total_approved_amount: 0,
    variation_amount: 0,
    sub_total_amount: 0,
    vat_amount: 0,
    markup_amount: 0,
    proposed_start_date: "",
    proposed_end_date: "",
    approved_start_date: "",
    approved_end_date: "",
    actual_end_date: "",
    type: "third-party",
    status: "pending",

    // New state - Classification
    project_type: "capital",
    priority: "medium",
    strategic_alignment: "",

    // New state - Organizational
    ministry_id: null,
    implementing_agency_id: null,
    sponsoring_department_id: null,
    project_manager_id: null,

    // New state - Financial
    fund_id: null,
    budget_year: "",
    budget_head_code: "",
    total_revised_amount: 0,
    total_actual_cost: 0,
    contingency_amount: 0,
    contingency_percentage: 10,

    // New state - Lifecycle
    lifecycle_stage: "concept",
    execution_status: "not-started",
    overall_health: "on-track",

    // New state - Procurement
    procurement_method: null,
    procurement_reference: null,
    procurement_type: null,
    method_justification: null,
    requires_bpp_clearance: false,
    bpp_no_objection_invite: null,
    bpp_no_objection_award: null,
    bpp_invite_date: null,
    bpp_award_date: null,
    advertised_at: null,
    advertisement_reference: null,

    // New state - Additional Dates
    concept_date: "",
    approval_date: "",
    commencement_order_date: "",
    revised_end_date: "",
    handover_date: "",
    warranty_expiry_date: "",

    // New state - Progress Metrics
    physical_progress_percentage: 0,
    financial_progress_percentage: 0,
    time_elapsed_percentage: 0,

    // New state - Compliance
    has_environmental_clearance: false,
    environmental_clearance_date: "",
    has_land_acquisition: false,
    land_acquisition_status: "not-required",
    requires_public_consultation: false,
    public_consultation_completed: false,

    // New state - Risk
    risk_level: "low",
    has_active_issues: false,
    issues_count: 0,

    // New state - Metadata
    is_multi_year: false,
    is_archived: false,
    archived_at: "",
    archived_by: null,
  },
  actions: [
    {
      label: "manage",
      icon: "ri-settings-3-line",
      variant: "success",
      conditions: [],
      operator: "and",
      display: "Manage",
    },
  ],
};
