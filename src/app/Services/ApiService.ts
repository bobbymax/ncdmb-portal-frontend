import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ConfigProvider } from "@providers/ConfigProvider";
import { AuthProvider } from "@providers/AuthProvider";

export class ApiService {
  private api: AxiosInstance;
  private auth: AuthProvider;

  constructor() {
    const endpoint = ConfigProvider.get("api");
    this.auth = new AuthProvider();

    this.api = axios.create({
      baseURL: endpoint,
      timeout: 10000,
    });

    if (this.auth.isAuthenticated()) {
      this.api.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
          const token = this.auth.getToken();

          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }

          return config;
        }
      );

      this.api.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error) => {
          return Promise.reject(error);
        }
      );
    }
  }

  async get<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, { params });
  }

  async post<T>(
    url: string,
    data: Record<string, any>
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data);
  }

  async put<T>(
    url: string,
    data: Record<string, any>
  ): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url);
  }
}
