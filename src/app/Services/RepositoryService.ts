import { AxiosError, AxiosResponse } from "axios";
import { ApiService } from "./ApiService";
import { JsonResponse } from "../Repositories/BaseRepository";

export interface ServerResponse {
  code?: number;
  data: JsonResponse | JsonResponse[];
  message: string;
  status: "success" | "error";
}

interface IRepository {
  collection: () => Promise<ServerResponse>;
  customCollection: (url: string) => Promise<ServerResponse>;
  show: (param: string | number) => Promise<ServerResponse>;
  store: (body: Record<string, any>) => Promise<ServerResponse>;
  customStore: (
    url: string,
    body: Record<string, any>
  ) => Promise<ServerResponse>;
  update: (
    param: string | number,
    data: Record<string, any>
  ) => Promise<ServerResponse>;
  destroy: (param: string | number) => Promise<ServerResponse>;
}

export abstract class RepositoryService implements IRepository {
  protected api: ApiService;
  protected url: string;

  constructor(url: string) {
    this.api = new ApiService();
    this.url = url;
  }

  isServerErrorResponse = (data: any): data is { message: string } => {
    return data && typeof data.message === "string";
  };

  async collection(): Promise<ServerResponse> {
    try {
      const response: AxiosResponse<ServerResponse> = await this.api.get(
        this.url
      );
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

  async customCollection(url: string): Promise<ServerResponse> {
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

  async show(param: string | number): Promise<ServerResponse> {
    try {
      const response: AxiosResponse<ServerResponse> = await this.api.get(
        `${this.url}/${param}`
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

  async store(body: Record<string, any>): Promise<ServerResponse> {
    try {
      const response: AxiosResponse<ServerResponse> = await this.api.post(
        this.url,
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

  async customStore(
    url: string,
    body: Record<string, any>
  ): Promise<ServerResponse> {
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
    param: string | number,
    body: Record<string, any>
  ): Promise<ServerResponse> {
    try {
      const response: AxiosResponse<ServerResponse> = await this.api.put(
        `${this.url}/${param}`,
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

  async destroy(param: string | number): Promise<ServerResponse> {
    try {
      const response: AxiosResponse<ServerResponse> = await this.api.delete(
        `${this.url}/${param}`
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
