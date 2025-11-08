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
import { ProjectEvaluationCommitteeResponseData } from "./data";
import { projectEvaluationCommitteeRules } from "./rules";
import { projectEvaluationCommitteeViews } from "./views";
import { projectEvaluationCommitteeColumns } from "./columns";
import { projectEvaluationCommitteeConfig } from "./config";

export default class ProjectEvaluationCommitteeRepository extends BaseRepository {
  public fillables: Array<keyof ProjectEvaluationCommitteeResponseData> =
    projectEvaluationCommitteeConfig.fillables;
  public rules: { [key: string]: string } = projectEvaluationCommitteeRules;
  public views: ViewsProps[] = projectEvaluationCommitteeViews;
  protected state: ProjectEvaluationCommitteeResponseData = projectEvaluationCommitteeConfig.state;
  public columns: ColumnData[] = projectEvaluationCommitteeColumns;
  public actions: ButtonsProp[] = projectEvaluationCommitteeConfig.actions;

  public fromJson(data: JsonResponse): ProjectEvaluationCommitteeResponseData {
    return {
      id: data.id ?? 0,
      project_id: data.project_id ?? 0,
      committee_name: data.committee_name ?? "",
      committee_type: data.committee_type ?? "technical",
      chairman_id: data.chairman_id ?? 0,
      members: data.members ?? null,
      status: data.status ?? "active",
      formed_at: data.formed_at ?? null,
      dissolved_at: data.dissolved_at ?? null,
      project: data.project ?? undefined,
      chairman: data.chairman ?? undefined,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }

  public associatedResources: DependencyProps[] =
    projectEvaluationCommitteeConfig.associatedResources;
}

