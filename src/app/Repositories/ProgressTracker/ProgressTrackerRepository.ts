import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { ProgressTrackerResponseData } from "./data";
import { progressTrackerRules } from "./rules";
import { progressTrackerViews } from "./views";
import { progressTrackerColumns } from "./columns";
import { progressTrackerConfig } from "./config";

export default class ProgressTrackerRepository extends BaseRepository {
  public fillables: Array<keyof ProgressTrackerResponseData> =
    progressTrackerConfig.fillables;
  public rules: { [key: string]: string } = progressTrackerRules;
  public views: ViewsProps[] = progressTrackerViews;
  protected state: ProgressTrackerResponseData = progressTrackerConfig.state;
  public columns: ColumnData[] = progressTrackerColumns;
  public actions: ButtonsProp[] = progressTrackerConfig.actions;
  public fromJson(
    data: ProgressTrackerResponseData
  ): ProgressTrackerResponseData {
    return {
      id: data.id ?? 0,
      workflow_id: data.workflow_id ?? 0,
      workflow_stage_id: data.workflow_stage_id ?? 0,
      document_type_id: data.document_type_id ?? 0,
      fallback_to_stage_id: data.fallback_to_stage_id ?? 0,
      return_to_stage_id: data.return_to_stage_id ?? 0,
      stage: data.stage ?? null,
      trackerActions: data.trackerActions ?? [],
      trackerRecipients: data.trackerRecipients ?? [],
      order: data.order ?? 0,
      stages: data.stages ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    progressTrackerConfig.associatedResources;
}
