import {
  ButtonsProp,
  ColumnData,
} from "../../resources/views/components/tables/CustomDataTable";
import {
  BaseRepository,
  BaseResponse,
  DependencyProps,
  ViewsProps,
} from "./BaseRepository";
import { RoleResponseData } from "./RoleRepository";

export interface UserResponseData extends BaseResponse {
  name: string;
  email: string;
  password?: string;
  staff_no: string;
  is_logged_in?: boolean;
  roles?: RoleResponseData[];
}

export default class UserRepository extends BaseRepository {
  public component: string = "Users";
  public path: string = "/users";
  public fillables: Array<keyof UserResponseData> = [
    "name",
    "email",
    "staff_no",
    "roles",
  ];

  public associatedResources: DependencyProps[] = [
    { name: "roles", url: "roles" },
  ];

  public views: ViewsProps[] = [
    {
      title: "Users List",
      server_url: "users",
      component: "Users",
      frontend_path: "/users",
      type: "index",
      tag: "Create User",
      mode: "list",
    },
    {
      title: "Create User",
      server_url: "users",
      component: "User",
      frontend_path: "/users/create",
      type: "form-page",
      tag: "",
      mode: "store",
      action: "Add User",
      index_path: "/users",
    },
    {
      title: "Manage User",
      server_url: "users",
      component: "User",
      frontend_path: "/users/:id/manage",
      type: "form-page",
      tag: "",
      mode: "update",
      action: "Update Record",
      index_path: "/users",
    },
  ];
  protected state: UserResponseData = {
    id: 0,
    name: "",
    email: "",
    staff_no: "",
    roles: [],
  };

  public columns: ColumnData[] = [
    {
      label: "Name",
      accessor: "name",
      type: "text",
    },
    {
      label: "Email",
      accessor: "email",
      type: "text",
    },
    {
      label: "Staff ID",
      accessor: "staff_no",
      type: "text",
    },
    {
      label: "Logged In",
      accessor: "is_logged_in",
      type: "bool",
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

  public rules: { [key: string]: string } = {
    name: "required|string",
    email: "required|email",
    staff_no: "required|string",
  };

  public fromJson(data: UserResponseData): UserResponseData {
    return {
      id: data.id ?? 0,
      name: data.name ?? "",
      email: data.email ?? "",
      staff_no: data.staff_no ?? "",
      is_logged_in: data.is_logged_in ?? false,
      roles: data.roles ?? [],
    };
  }
}
