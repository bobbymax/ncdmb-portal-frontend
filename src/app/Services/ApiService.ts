import { AxiosInstance, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import apiInstance from "app/init";

export class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = apiInstance;
  }

  async createSession() {
    return await this.api.get("/sanctum/csrf-cookie");
  }

  async fetcher<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(`/api${url}`, {
      responseType: "blob",
    });
  }

  async get<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(`/api/${url}`, params);
  }

  async post<T>(
    url: string,
    data: Record<string, unknown> | FormData
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(`/api/${url}`, data, {
      headers: {
        "Content-Type": this.getDataFormat(data),
        "X-XSRF-Token": Cookies.get("XSRF-TOKEN"),
      },
    });
  }

  async put<T>(
    url: string,
    data: Record<string, unknown> | FormData
  ): Promise<AxiosResponse<T>> {
    if (data instanceof FormData) {
      if (!data.has("_method")) {
        data.append("_method", "PUT");
      }

      return this.api.post<T>(`/api/${url}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-XSRF-Token": Cookies.get("XSRF-TOKEN"),
        },
      });
    }

    return this.api.put<T>(`/api/${url}`, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(`/api/${url}`);
  }

  private getDataFormat(data: Record<string, unknown> | FormData): string {
    return data instanceof FormData
      ? "multipart-form-data"
      : "application/json";
  }
}
