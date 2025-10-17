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
import { DepartmentResponseData } from "./data";
import { departmentRules } from "./rules";
import { departmentViews } from "./views";
import { departmentColumns } from "./columns";
import { departmentConfig } from "./config";

// "plop": "plop --require ts-node/register"

export default class DepartmentRepository extends BaseRepository {
  public fillables: Array<keyof DepartmentResponseData> =
    departmentConfig.fillables;
  public rules: { [key: string]: string } = departmentRules;
  public views: ViewsProps[] = departmentViews;
  protected state: DepartmentResponseData = departmentConfig.state;
  public columns: ColumnData[] = departmentColumns;
  public actions: ButtonsProp[] = departmentConfig.actions;
  public fromJson(data: JsonResponse): DepartmentResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      abv: data.abv ?? "",
      bco: data.bco ?? 0,
      bo: data.bo ?? 0,
      director: data.director ?? 0,
      is_blocked: data.is_blocked ?? 0,
      parentId: data.parentId ?? 0,
      type: data.type ?? "department",
      signatory_staff_id: data.signatory_staff_id ?? 0,
      alternate_signatory_staff_id: data.alternate_signatory_staff_id ?? 0,
      created_at: data.created_at ?? "",
      updated_at: data.updated_at ?? "",
      deleted_at: data.deleted_at ?? "",
    };
  }
  public associatedResources: DependencyProps[] =
    departmentConfig.associatedResources;
}
