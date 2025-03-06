import { RepositoryService } from "../Services/RepositoryService";
import {
  ButtonsProp,
  ColumnData,
} from "../../resources/views/components/tables/CustomDataTable";
import { AxiosResponse } from "axios";
import { DocumentableData } from "app/Hooks/useWorkflow";
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
  label: string;
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
    | "card"
    | "docket";
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

  public prepareServerData = (data: Record<string, any>): FormData | null => {
    if (!data) {
      return null;
    }

    const result = new FormData();

    this.fillables.forEach((key) => {
      if (key in data) {
        const value = data[key];

        if (value instanceof File) {
          // Single file
          result.append(key, value);
        } else if (Array.isArray(value)) {
          if (value.every((item) => item instanceof File)) {
            // Array of files
            value.forEach((file) => result.append(`${key}[]`, file));
          } else {
            // Non-file array
            result.append(key, JSON.stringify(value));
          }
        } else {
          // Append an empty string for null or undefined values (optional)
          result.append(key, value?.toString() || "");
        }
      }
    });

    return result;
  };

  public getState(): JsonResponse {
    return this.state;
  }

  public getFiles = async (filePaths: string[]): Promise<File[]> => {
    if (filePaths.length < 1) {
      return Promise.resolve([] as File[]);
    }

    const fileUrls: (File | null)[] = await Promise.all(
      filePaths.map(async (path, idx) => {
        try {
          const response = await this.fetchFile(path);

          if (!response || !response.blob || !response.type) {
            return null;
          }

          // Create a Blob and generate a URL for it
          const fileName = path.split("/").pop() || `file-${idx}`;
          return new File([response.blob], fileName, { type: response.type });
        } catch (error) {
          console.error("Error fetching file:", error);
          return null;
        }
      })
    );

    // Filter out nulls (failed fetches) before returning
    return fileUrls.filter((file): file is File => file !== null);
  };

  public dependencies = async (): Promise<JsonResponse> => {
    if (this.associatedResources.length < 1) {
      return Promise.resolve({} as JsonResponse);
    }

    const requests: Promise<AxiosResponse<ApiResponse>>[] =
      this.associatedResources.map(
        (item) =>
          this.api.get<ApiResponse>(item.url) as Promise<
            AxiosResponse<ApiResponse>
          >
      );

    const responses = await Promise.all(requests);
    const collection = responses.map((res) => res.data.data);

    return collection.reduce((acc, resSet, i) => {
      acc[this.associatedResources[i].name] = resSet;
      return acc;
    }, {} as JsonResponse);
  };
}
