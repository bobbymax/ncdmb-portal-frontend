import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { TripResponseData } from "./data";
import { tripRules } from "./rules";
import { tripViews } from "./views";
import { tripColumns } from "./columns";
import { tripConfig } from "./config";

export default class TripRepository extends BaseRepository {
  public fillables: Array<keyof TripResponseData> = tripConfig.fillables;
  public rules: { [key: string]: string } = tripRules;
  public views: ViewsProps[] = tripViews;
  protected state: TripResponseData = tripConfig.state;
  public columns: ColumnData[] = tripColumns;
  public actions: ButtonsProp[] = tripConfig.actions;
  public fromJson(data: TripResponseData): TripResponseData {
    return {
      id: data.id ?? 0,
      claim_id: data.claim_id ?? 0,
      airport_id: data.airport_id ?? 0,
      departure_city_id: data.departure_city_id ?? 0,
      destination_city_id: data.destination_city_id ?? 0,
      per_diem_category_id: data.per_diem_category_id ?? 0,
      trip_category_id: data.trip_category_id ?? 0,
      purpose: data.purpose ?? "",
      route: data.route ?? "one-way",
      distance: data.distance ?? 0,
      departure_date: data.departure_date ?? "",
      return_date: data.return_date ?? "",
      total_amount_spent: data.total_amount_spent ?? 0,
      category: data.category ?? null,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }

  public getState(): TripResponseData {
    return this.state;
  }

  public associatedResources: DependencyProps[] =
    tripConfig.associatedResources;
}
