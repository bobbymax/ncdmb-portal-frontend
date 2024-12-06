import { AxiosError, AxiosResponse } from "axios";
import { ApiService, NetworkStatus } from "./ApiService";
import { JsonResponse } from "../Repositories/BaseRepository";

export interface ServerResponse {
  code?: number;
  data: JsonResponse | JsonResponse[];
  message: string;
  status: "success" | "error";
}

interface IRepository {
  collection: (url: string) => Promise<ServerResponse>;
  show: (url: string, param: string | number) => Promise<ServerResponse>;
  store: (url: string, body: Record<string, any>) => Promise<ServerResponse>;
  update: (
    url: string,
    param: string | number,
    data: Record<string, any>
  ) => Promise<ServerResponse>;
  destroy: (url: string, param: string | number) => Promise<ServerResponse>;
}

export abstract class RepositoryService implements IRepository {
  protected api: ApiService;

  constructor() {
    this.api = new ApiService();
  }

  isServerErrorResponse = (data: any): data is { message: string } => {
    return data && typeof data.message === "string";
  };

  checkNetworkStatus = (callback: (status: NetworkStatus) => void) => {
    this.api.onNetworkStatus(callback);
  };

  async collection(url: string): Promise<ServerResponse> {
    try {
      const response: AxiosResponse<ServerResponse> = await this.api.get(url);
      const code = response.status;
      return { code, ...response.data };
    } catch (error) {
      const err = error as AxiosError;
      console.error("Collection cannot be found: ", err.message);
      // Use type guard here
      const errorMessage = this.isServerErrorResponse(err.response?.data)
        ? err.response?.data.message
        : "Collection cannot be found";

      return {
        code: err.response?.status || 500,
        data: [],
        message: errorMessage || "An unexpected error occurred",
        status: "error",
      };
    }
  }

  async show(url: string, param: string | number): Promise<ServerResponse> {
    try {
      const response: AxiosResponse<ServerResponse> = await this.api.get(
        `${url}/${param}`
      );

      const code = response.status;
      return { code, ...response.data };
    } catch (error) {
      console.error(
        `Resource with value ${param} could not be found on our servers`,
        error
      );
      return {
        code: 500,
        data: { id: 0 },
        message: `Resource with value ${param} could not be found on our servers`,
        status: "error",
      };
    }
  }

  async store(url: string, body: Record<string, any>): Promise<ServerResponse> {
    try {
      const response: AxiosResponse<ServerResponse> = await this.api.post(
        url,
        body
      );
      const code = response.status;
      return { code, ...response.data };
    } catch (error) {
      console.error("This record was not created", error);
      return {
        code: 500,
        data: { id: 0 },
        message: "This record was not created",
        status: "error",
      };
    }
  }

  async update(
    url: string,
    param: string | number,
    body: Record<string, any>
  ): Promise<ServerResponse> {
    try {
      const response: AxiosResponse<ServerResponse> = await this.api.put(
        `${url}/${param}`,
        body
      );
      const code = response.status;
      return { code, ...response.data };
    } catch (error) {
      console.error("This Record was not found on our database!!", error);
      return {
        code: 500,
        data: { id: 0 },
        message: "This Record was not found on our database!!",
        status: "error",
      };
    }
  }

  async destroy(url: string, param: string | number): Promise<ServerResponse> {
    try {
      const response: AxiosResponse<ServerResponse> = await this.api.delete(
        `${url}/${param}`
      );

      const code = response.status;
      return { code, ...response.data };
    } catch (error) {
      console.error("The delete action was not carried out!!", error);
      return {
        code: 500,
        data: { id: 0 },
        message: "The delete action was not carried out!!",
        status: "error",
      };
    }
  }
}
