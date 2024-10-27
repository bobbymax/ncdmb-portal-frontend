import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
// import { ConfigProvider } from "../Providers/ConfigProvider";
import { AuthProvider } from "../Providers/AuthProvider";

export class ApiService {
  private api: AxiosInstance;
  private auth: AuthProvider;

  constructor() {
    // const endpoint = ConfigProvider.get("api");
    this.auth = new AuthProvider();

    this.api = axios.create({
      baseURL:
        process.env.REACT_API_ENDPOINT ?? "https://api-manager.test/api/",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (this.auth.isAuthenticated()) {
      this.api.interceptors.request.use(
        (
          config: AxiosRequestConfig
        ):
          | InternalAxiosRequestConfig<any>
          | Promise<InternalAxiosRequestConfig<any>> => {
          const token = this.auth.getToken();

          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }

          return config as
            | InternalAxiosRequestConfig<any>
            | Promise<InternalAxiosRequestConfig<any>>;
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
