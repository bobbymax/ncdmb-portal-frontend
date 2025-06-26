import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import { BaseRepository, DependencyProps, ViewsProps } from "../BaseRepository";
import { SignatoryResponseData } from "./data";
import { signatoryRules } from "./rules";
import { signatoryViews } from "./views";
import { signatoryColumns } from "./columns";
import { signatoryConfig } from "./config";

export default class SignatoryRepository extends BaseRepository {
  public fillables: Array<keyof SignatoryResponseData> =
    signatoryConfig.fillables;
  public rules: { [key: string]: string } = signatoryRules;
  public views: ViewsProps[] = signatoryViews;
  protected state: SignatoryResponseData = signatoryConfig.state;
  public columns: ColumnData[] = signatoryColumns;
  public actions: ButtonsProp[] = signatoryConfig.actions;
  public fromJson(data: SignatoryResponseData): SignatoryResponseData {
    return {
      id: data.id ?? 0,
      page_id: data.page_id ?? 0,
      group_id: data.page_id ?? 0,
      department_id: data.department_id ?? 0,
      type: data.type ?? "owner",
      order: data.order ?? 0,
      compound: data.compound ?? "",
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    signatoryConfig.associatedResources;
}
