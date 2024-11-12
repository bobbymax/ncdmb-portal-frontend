import {
  ColumnData,
  ButtonsProp,
} from "resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  BaseResponse,
  DependencyProps,
  ViewsProps,
} from "./BaseRepository";
import { RoleResponseData } from "./RoleRepository";

export interface ModuleResponseData extends BaseResponse {
  name: string;
  parent_id: number;
  path: string;
  slug?: string;
  type: "application" | "module" | "page" | "";
  icon: string;
  roles: RoleResponseData[];
}

export default class ModuleRepository extends BaseRepository {
  public path: string = "/modules";
  public fillables: Array<keyof ModuleResponseData> = [
    "name",
    "icon",
    "parent_id",
    "path",
    "type",
    "roles",
  ];
  public associatedResources: DependencyProps[] = [
    { name: "roles", url: "roles" },
    { name: "modules", url: "modules" },
  ];
  public rules: { [key: string]: string } = {
    name: "required|string",
    icon: "required|string",
    parent_id: "number",
    path: "required|string",
    type: "required|string",
    roles: "required|array",
  };
  public views: ViewsProps[] = [
    {
      title: "Modules List",
      server_url: "modules",
      component: "Modules",
      frontend_path: "/modules",
      type: "index",
      tag: "Add Module",
      mode: "list",
    },
    {
      title: "Create Module",
      server_url: "modules",
      component: "Module",
      frontend_path: "/modules/create",
      type: "form-page",
      tag: "Go Back",
      mode: "store",
      action: "Store Module",
      index_path: "/modules",
    },
    {
      title: "Manage Module",
      server_url: "modules",
      component: "Module",
      frontend_path: "/modules/:id/manage",
      type: "form-page",
      tag: "Go Back",
      mode: "update",
      action: "Update Module",
      index_path: "/modules",
    },
  ];
  protected state: ModuleResponseData = {
    id: 0,
    name: "",
    parent_id: 0,
    path: "",
    type: "",
    icon: "",
    roles: [],
  };
  public columns: ColumnData[] = [
    {
      label: "Name",
      accessor: "name",
      type: "text",
    },
    {
      label: "Path",
      accessor: "path",
      type: "text",
    },
    {
      label: "Type",
      accessor: "type",
      type: "text",
    },
    {
      label: "Icon",
      accessor: "icon",
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

  private formatRoles: (roles: any) => RoleResponseData[] = (roles: any) => {
    let refinedRoles: RoleResponseData[] = [];

    roles.map((role: RoleResponseData) =>
      refinedRoles.push({
        id: role.id,
        name: role.name,
      })
    );

    return refinedRoles;
  };

  public component: string = "Modules";
  public fromJson(data: ModuleResponseData): ModuleResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      path: data.path ?? "",
      type: data.type ?? "",
      icon: data.icon ?? "",
      parent_id: data.parent_id ?? 0,
      roles: (data.roles as RoleResponseData[]) || [],
    };
  }
}
