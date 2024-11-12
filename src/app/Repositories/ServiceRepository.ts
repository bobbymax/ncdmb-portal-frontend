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

export interface ServiceResponseData extends BaseResponse {
  application: string;
  slug?: string;
  url: string;
  apiKey: string;
  max_request_per_day: number;
  not_active?: boolean;
}

export default class ServiceRepository extends BaseRepository {
  public path: string = "/services";
  public fillables: Array<keyof ServiceResponseData> = [
    "application",
    "apiKey",
    "url",
    "max_request_per_day",
  ];
  public rules: { [key: string]: string } = {
    application: "required|string",
    apiKey: "required|string",
    url: "required|string",
    max_request_per_day: "required|integer",
  };
  public views: ViewsProps[] = [
    {
      title: "Services List",
      server_url: "services",
      component: "Services",
      frontend_path: "/services",
      type: "index",
      tag: "Add Application Service",
      mode: "list",
    },
    {
      title: "Add Application",
      server_url: "services",
      component: "Service",
      frontend_path: "/services/create",
      type: "form-page",
      tag: "",
      mode: "store",
      action: "Add Service",
      index_path: "/services",
    },
    {
      title: "Manage Application Service",
      server_url: "services",
      component: "Service",
      frontend_path: "/services/:id/manage",
      type: "form-page",
      tag: "",
      mode: "update",
      action: "Update Application Service",
      index_path: "/services",
    },
    {
      title: "Cleared Payments",
      server_url: "services",
      component: "Payment",
      frontend_path: "/services/:id/payments",
      type: "external",
      tag: "",
      mode: "list",
      action: "Post to SunSystems",
      index_path: "/services",
      post_server_url: "service/payments",
    },
  ];
  protected state: ServiceResponseData = {
    id: 0,
    application: "",
    apiKey: "",
    url: "",
    max_request_per_day: 0,
  };
  public columns: ColumnData[] = [
    {
      label: "Application",
      accessor: "application",
      type: "text",
    },
    {
      label: "Link",
      accessor: "url",
      type: "text",
    },
    {
      label: "Requests per Day",
      accessor: "max_request_per_day",
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
    {
      label: "payments",
      icon: "ri-wallet-2-line",
      variant: "dark",
      conditions: [],
      operator: "and",
      display: "Payments",
    },
  ];

  public component: string = "Services";
  public fromJson(data: ServiceResponseData): ServiceResponseData {
    return {
      id: data.id ?? 0,
      application: data.application ?? "",
      slug: data.slug ?? "",
      apiKey: data.apiKey ?? "",
      url: data.url ?? "",
      max_request_per_day: data.max_request_per_day ?? 0,
      not_active: data.not_active || false,
    };
  }
  public associatedResources: DependencyProps[] = [];
}
