import {
  ButtonsProp,
  ColumnData,
} from "resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  BaseResponse,
  DependencyProps,
  JsonResponse,
  ViewsProps,
} from "./BaseRepository";

export interface RoleResponseData extends BaseResponse {
  name: string;
}

export default class RoleRepository extends BaseRepository {
  public component: string = "Roles";
  public path: string = "/roles";
  public fillables: Array<keyof RoleResponseData> = ["name"];
  public rules: { [key: string]: string } = {
    name: "required|string",
  };

  public associatedResources: DependencyProps[] = [];
  protected state: RoleResponseData = {
    id: 0,
    name: "",
  };
  public views: ViewsProps[] = [
    {
      title: "Roles List",
      server_url: "roles",
      component: "Roles",
      frontend_path: "/roles",
      type: "index",
      tag: "Add Role",
      mode: "list",
    },
    {
      title: "Create Role",
      server_url: "roles",
      component: "Role",
      frontend_path: "/roles/create",
      type: "form-page",
      tag: "Go Back",
      mode: "store",
      action: "Add Role",
      index_path: "/roles",
    },
    {
      title: "Manage Role",
      server_url: "roles",
      component: "Role",
      frontend_path: "/roles/:id/manage",
      type: "form-page",
      tag: "Go Back",
      mode: "update",
      action: "Update Role",
      index_path: "/roles",
    },
  ];

  public columns: ColumnData[] = [
    {
      label: "Name",
      accessor: "name",
      type: "text",
    },
  ];
  public actions: ButtonsProp[] = [
    {
      label: "manage",
      icon: "ri-settings-3-line",
      variant: "success",
      conditions: [],
      operator: "and",
      display: "Manage",
    },
  ];
  public fromJson(data: JsonResponse): JsonResponse {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
    };
  }
}
