import { AxiosResponse } from "axios";
import { ApiService } from "@services/ApiService";
import { JsonResponse } from "@repositories/BaseRepository";

export interface ServerResponse {
  code?: number;
  data: JsonResponse | JsonResponse[];
  message: string;
  status: "success" | "error";
}

interface IRepository {
  collection: () => Promise<ServerResponse>;
  show: (param: string | number) => Promise<ServerResponse>;
  store: (body: Record<string, any>) => Promise<ServerResponse>;
  update: (
    param: string | number,
    data: Record<string, any>
  ) => Promise<ServerResponse>;
  destroy: (param: string | number) => Promise<ServerResponse>;
}

export abstract class RepositoryService implements IRepository {
  private api: ApiService;
  protected url: string;

  constructor(url: string) {
    this.api = new ApiService();
    this.url = url;
  }

  async collection(): Promise<ServerResponse> {
    try {
      const response: AxiosResponse<ServerResponse> = await this.api.get(
        this.url
      );
      const code = response.status;
      return { code, ...response.data };
    } catch (error) {
      console.error("Collection cannot be found: ", error);
      return {
        code: 500,
        data: [],
        message: "Collection cannot be found",
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
