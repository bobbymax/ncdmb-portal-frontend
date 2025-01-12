import { RepositoryService } from "../Services/RepositoryService";
import {
  ButtonsProp,
  ColumnData,
} from "../../resources/views/components/tables/CustomDataTable";
import { AxiosResponse } from "axios";
export interface BaseResponse {
  id: number;
}
export interface DependencyProps {
  url: string;
  name: string;
}
// Define the ApiResponse interface if needed
interface ApiResponse {
  data: {
    data: any; // Replace `any` with actual expected data type if available
  };
}

export type ModalResponseData<D = JsonResponse> = {
  data: D;
  action: "store" | "update" | "delete";
  message: string;
};

export interface PageModalProps<T extends BaseRepository, D = JsonResponse> {
  title: string;
  close: () => void;
  show: boolean;
  size?: "sm" | "md" | "lg";
  data: D | null;
  isUpdating: boolean;
  submit: (response: ModalResponseData) => void;
  manage: (data: D) => void;
  destroy: (rawId: number) => void;
  Repo: T;
}

export interface ConfigProp<T> {
  fillables: Array<keyof T>;
  associatedResources: DependencyProps[];
  state: T;
  actions: ButtonsProp[];
}

export interface TabOptionProps {
  title: string;
  component: string;
  icon: string;
  variant: string;
  endpoint: string;
  status: string;
  hasFile: boolean;
  appendSignature: boolean;
  isDefault: boolean;
  path?: string;
}

export interface ViewsProps {
  title: string;
  server_url: string;
  component: string;
  frontend_path: string;
  type:
    | "index"
    | "form"
    | "dashboard"
    | "lock-page"
    | "page"
    | "external"
    | "card";
  mode: "store" | "update" | "list";
  tag?: string;
  action?: string;
  index_path?: string;
  post_server_url?: string;
  pointer?: string;
  documentControl?: string[];
  tabs?: TabOptionProps[];
}
export type JsonResponse = BaseResponse & Record<string, any>;
export abstract class BaseRepository extends RepositoryService {
  // This is the path for the frontend route of the repository
  public abstract fillables: Array<keyof JsonResponse>;
  public abstract rules: { [key: string]: string };
  public abstract views: ViewsProps[];

  // This is the repository initialState
  protected abstract state: JsonResponse;
  public abstract columns: ColumnData[];
  public abstract actions: ButtonsProp[];

  public abstract fromJson(data: JsonResponse): JsonResponse;
  public abstract associatedResources: DependencyProps[];

  public formatDataOnSubmit = (
    data: Record<string, any>
  ): FormData | Record<string, any> => {
    const result: Record<string, any> = {};

    this.fillables.forEach((key) => {
      if (key in data) {
        result[key] = data[key];
      }
    });

    return result;
  };

  public getState(): JsonResponse {
    return this.state;
  }

  public dependencies = async (): Promise<JsonResponse> => {
    if (this.associatedResources.length < 1) {
      return Promise.resolve({} as JsonResponse);
    }

    const requests: Promise<AxiosResponse<ApiResponse>>[] =
      this.associatedResources.map((item) =>
        this.api.get<ApiResponse>(item.url)
      );

    const responses = await Promise.all(requests);
    const collection = responses.map((res) => res.data.data);

    return collection.reduce((acc, resSet, i) => {
      acc[this.associatedResources[i].name] = resSet;
      return acc;
    }, {} as JsonResponse);
  };
}
