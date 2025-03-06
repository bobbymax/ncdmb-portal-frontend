import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { RemunerationResponseData } from "./data";
import { remunerationRules } from "./rules";
import { remunerationViews } from "./views";
import { remunerationColumns } from "./columns";
import { remunerationConfig } from "./config";

export default class RemunerationRepository extends BaseRepository {
  public fillables: Array<keyof RemunerationResponseData> =
    remunerationConfig.fillables;
  public rules: { [key: string]: string } = remunerationRules;
  public views: ViewsProps[] = remunerationViews;
  protected state: RemunerationResponseData = remunerationConfig.state;
  public columns: ColumnData[] = remunerationColumns;
  public actions: ButtonsProp[] = remunerationConfig.actions;
  public fromJson(data: RemunerationResponseData): RemunerationResponseData {
    return {
      id: data.id ?? 0,
      allowance_id: data.allowance_id ?? 0,
      grade_level_id: data.grade_level_id ?? 0,
      amount: data.amount ?? 0,
      is_active: data.is_active ?? 0,
      currency: data.currency ?? "NGN",
      start_date: data.start_date ?? "",
      expiration_date: data.expiration_date ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    remunerationConfig.associatedResources;
}
