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
import { ThresholdResponseData } from "./data";
import { thresholdRules } from "./rules";
import { thresholdViews } from "./views";
import { thresholdColumns } from "./columns";
import { thresholdConfig } from "./config";

export default class ThresholdRepository extends BaseRepository {
  public fillables: Array<keyof ThresholdResponseData> =
    thresholdConfig.fillables;
  public rules: { [key: string]: string } = thresholdRules;
  public views: ViewsProps[] = thresholdViews;
  protected state: ThresholdResponseData = thresholdConfig.state;
  public columns: ColumnData[] = thresholdColumns;
  public actions: ButtonsProp[] = thresholdConfig.actions;
  public fromJson(data: JsonResponse): ThresholdResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      amount: data.amount ?? "",
      type: data.type ?? "WO",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    thresholdConfig.associatedResources;
}
