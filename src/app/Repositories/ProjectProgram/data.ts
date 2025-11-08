import { BaseResponse } from "../BaseRepository";
import type { ProjectResponseData } from "../Project/data";

export type ProgramStatus =
  | "concept"
  | "approved"
  | "active"
  | "suspended"
  | "completed"
  | "cancelled";

export type ProgramPriority = "critical" | "high" | "medium" | "low";

export type ProgramHealth = "on-track" | "at-risk" | "critical" | "completed";

export interface ProjectProgramResponseData extends BaseResponse {
  // Identification
  code: string;
  title: string;
  description: string;

  // Organizational Links
  user_id: number;
  department_id: number;
  ministry_id: number | null;
  project_category_id: number | null;

  // Aggregate Financials
  total_estimated_amount: number;
  total_approved_amount: number;
  total_actual_cost: number;

  // Timeline
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string | null;
  actual_end_date: string | null;

  // Classification
  status: ProgramStatus;
  priority: ProgramPriority;
  strategic_alignment: string;

  // Progress
  overall_progress_percentage: number;
  overall_health: ProgramHealth;

  // Metadata
  is_archived: boolean;
  archived_at: string | null;
  archived_by: number | null;

  // Computed attributes
  total_phases?: number;
  active_phases?: number;
  completed_phases?: number;

  // Relationships
  phases?: ProjectResponseData[];

  // Timestamps
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

