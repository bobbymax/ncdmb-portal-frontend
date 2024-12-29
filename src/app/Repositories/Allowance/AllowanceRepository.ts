import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { AllowanceResponseData } from "./data";
import { allowanceRules } from "./rules";
import { allowanceViews } from "./views";
import { allowanceColumns } from "./columns";
import { allowanceConfig } from "./config";

export default class AllowanceRepository extends BaseRepository {
  public fillables: Array<keyof AllowanceResponseData> =
    allowanceConfig.fillables;
  public rules: { [key: string]: string } = allowanceRules;
  public views: ViewsProps[] = allowanceViews;
  protected state: AllowanceResponseData = allowanceConfig.state;
  public columns: ColumnData[] = allowanceColumns;
  public actions: ButtonsProp[] = allowanceConfig.actions;
  public fromJson(data: AllowanceResponseData): AllowanceResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      parent_id: data.parent_id ?? 0,
      departure_city_id: data.departure_city_id ?? 0,
      destination_city_id: data.destination_city_id ?? 0,
      days_required: data.days_required ?? 0,
      is_active: data.is_active ?? 0,
      description: data.description ?? "",
      category: data.category ?? "parent",
      component: data.component ?? "flight-non-resident",
      remunerations: data.remunerations ?? [],
      selectedRemunerations: data.selectedRemunerations ?? [],
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    allowanceConfig.associatedResources;
}
