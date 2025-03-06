import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import apiInstance from "app/init";
import { queue } from "./RequestQueue";
import CryptoJS from "crypto-js";

export class ApiService {
  private api: AxiosInstance;
  private SECRET_KEY = "ncdmb-staff-user";

  constructor() {
    this.api = apiInstance;
  }

  async createSession() {
    return await this.api.get("/sanctum/csrf-cookie");
  }

  private getUserId(): string | null {
    return Cookies.get("user_id") || null;
  }

  private generateIdentityMarker(): string | null {
    const user = this.getUserId();
    if (!user) return null;

    const timestamp = Date.now();
    const payload = `${user}:${timestamp}`;
    const signature = CryptoJS.HmacSHA256(payload, this.SECRET_KEY).toString();
    return `${payload}:${signature}`;
  }

  async request<T>(
    config: AxiosRequestConfig,
    data?: any
  ): Promise<AxiosResponse<T>> {
    const userId = this.getUserId() || null;

    return queue.addRequest(
      (identityMarker, metadata) =>
        this.api({
          ...config,
          withCredentials: true,
          headers: {
            ...config.headers,
            "X-XSRF-Token": Cookies.get("XSRF-TOKEN") || "",
            "X-Identity-Marker": identityMarker || "",
            "X-Frontend-URL": metadata?.frontendURL || "",
            "X-User-Agent": metadata?.userAgent || "",
            "X-Platform": metadata?.platform || "",
            "X-Screen-Size": metadata?.screenSize || "",
          },
        }).then((res) => res),
      userId
    );
  }

  async fetcher<T>(
    url: string,
    params?: Record<string, unknown>
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      method: "GET",
      url: `/api/${url}`,
      params,
      responseType: "blob",
    });
  }

  async get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.request<T>({ method: "GET", url: `/api/${url}`, params });
  }

  async post<T>(
    url: string,
    data: Record<string, unknown> | FormData
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({
      method: "POST",
      url: `/api/${url}`,
      data,
    });
  }

  async put<T>(
    url: string,
    data: Record<string, unknown> | FormData
  ): Promise<AxiosResponse<T>> {
    const isFormData = data instanceof FormData;

    if (isFormData && !data.has("_method")) {
      data.append("_method", "PUT");
    }

    return this.request<T>({
      method: isFormData ? "POST" : "PUT",
      url: `/api/${url}`,
      data,
    });
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.request<T>({
      method: "DELETE",
      url: `/api/${url}`,
    });
  }

  private getDataFormat(data: Record<string, unknown> | FormData): string {
    return data instanceof FormData
      ? "multipart-form-data"
      : "application/json";
  }
}
