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
import { ProjectProgramResponseData } from "./data";
import { projectProgramRules } from "./rules";
import { projectProgramViews } from "./views";
import { projectProgramColumns } from "./columns";
import { projectProgramConfig } from "./config";

export default class ProjectProgramRepository extends BaseRepository {
  public fillables: Array<keyof ProjectProgramResponseData> =
    projectProgramConfig.fillables;
  public rules: { [key: string]: string } = projectProgramRules;
  public views: ViewsProps[] = projectProgramViews;
  protected state: ProjectProgramResponseData = projectProgramConfig.state;
  public columns: ColumnData[] = projectProgramColumns;
  public actions: ButtonsProp[] = projectProgramConfig.actions;

  public fromJson(data: JsonResponse): ProjectProgramResponseData {
    return {
      id: data.id ?? 0,
      code: data.code ?? "",
      title: data.title ?? "",
      description: data.description ?? "",
      user_id: data.user_id ?? 0,
      department_id: data.department_id ?? 0,
      ministry_id: data.ministry_id ?? null,
      project_category_id: data.project_category_id ?? null,
      total_estimated_amount: data.total_estimated_amount ?? 0,
      total_approved_amount: data.total_approved_amount ?? 0,
      total_actual_cost: data.total_actual_cost ?? 0,
      planned_start_date: data.planned_start_date ?? "",
      planned_end_date: data.planned_end_date ?? "",
      actual_start_date: data.actual_start_date ?? null,
      actual_end_date: data.actual_end_date ?? null,
      status: data.status ?? "concept",
      priority: data.priority ?? "medium",
      strategic_alignment: data.strategic_alignment ?? "",
      overall_progress_percentage: data.overall_progress_percentage ?? 0,
      overall_health: data.overall_health ?? "on-track",
      is_archived: data.is_archived ?? false,
      archived_at: data.archived_at ?? null,
      archived_by: data.archived_by ?? null,
      total_phases: data.total_phases ?? 0,
      active_phases: data.active_phases ?? 0,
      completed_phases: data.completed_phases ?? 0,
      phases: data.phases ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      deleted_at: data.deleted_at ?? "",
    };
  }

  public associatedResources: DependencyProps[] =
    projectProgramConfig.associatedResources;
}

