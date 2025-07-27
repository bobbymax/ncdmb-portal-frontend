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
import { MilestoneResponseData } from "./data";
import { milestoneRules } from "./rules";
import { milestoneViews } from "./views";
import { milestoneColumns } from "./columns";
import { milestoneConfig } from "./config";

export default class MilestoneRepository extends BaseRepository {
  public fillables: Array<keyof MilestoneResponseData> =
    milestoneConfig.fillables;
  public rules: { [key: string]: string } = milestoneRules;
  public views: ViewsProps[] = milestoneViews;
  protected state: MilestoneResponseData = milestoneConfig.state;
  public columns: ColumnData[] = milestoneColumns;
  public actions: ButtonsProp[] = milestoneConfig.actions;
  public fromJson(data: JsonResponse): MilestoneResponseData {
    return {
      id: data.id ?? 0,
      milestoneable_id: data.milestoneable_id ?? 0,
      milestoneable_type: data.milestoneable_type ?? "",
      description: data.description ?? "",
      percentage_completion: data.percentage_completion ?? 0,
      duration: data.duration ?? 0,
      frequency: data.frequency ?? "days",
      status: data.status ?? "active",
      is_closed: data.is_closed ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    milestoneConfig.associatedResources;
}
