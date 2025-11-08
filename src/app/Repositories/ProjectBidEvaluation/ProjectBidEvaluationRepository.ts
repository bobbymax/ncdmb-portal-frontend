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
import { ProjectBidEvaluationResponseData } from "./data";
import { projectBidEvaluationRules } from "./rules";
import { projectBidEvaluationViews } from "./views";
import { projectBidEvaluationColumns } from "./columns";
import { projectBidEvaluationConfig } from "./config";

export default class ProjectBidEvaluationRepository extends BaseRepository {
  public fillables: Array<keyof ProjectBidEvaluationResponseData> =
    projectBidEvaluationConfig.fillables;
  public rules: { [key: string]: string } = projectBidEvaluationRules;
  public views: ViewsProps[] = projectBidEvaluationViews;
  protected state: ProjectBidEvaluationResponseData = projectBidEvaluationConfig.state;
  public columns: ColumnData[] = projectBidEvaluationColumns;
  public actions: ButtonsProp[] = projectBidEvaluationConfig.actions;

  public fromJson(data: JsonResponse): ProjectBidEvaluationResponseData {
    return {
      id: data.id ?? 0,
      project_bid_id: data.project_bid_id ?? 0,
      evaluator_id: data.evaluator_id ?? 0,
      evaluation_type: data.evaluation_type ?? "technical",
      evaluation_date: data.evaluation_date ?? "",
      criteria: data.criteria ?? null,
      total_score: data.total_score ?? null,
      pass_fail: data.pass_fail ?? null,
      comments: data.comments ?? null,
      recommendations: data.recommendations ?? null,
      status: data.status ?? "draft",
      project_bid: data.project_bid ?? undefined,
      evaluator: data.evaluator ?? undefined,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }

  public associatedResources: DependencyProps[] =
    projectBidEvaluationConfig.associatedResources;
}

