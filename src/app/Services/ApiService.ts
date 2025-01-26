import {
  AxiosInstance,
  AxiosProgressEvent,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AuthProvider } from "../Providers/AuthProvider";
import EventEmitter from "eventemitter3";
import accessPoint from ".";
export type NetworkStatus = {
  message: string;
  type: "good" | "poor";
};

export class ApiService {
  private api: AxiosInstance;
  private auth: AuthProvider;
  private emitter: EventEmitter;
  private tokenPromise: Promise<string | null> | null = null;
  private networkMonitorTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.auth = new AuthProvider();
    this.emitter = new EventEmitter();

    this.api = accessPoint;

    // this.addInterceptors();

    // this.startNetworkMonitoring();
  }

  private addInterceptors() {
    // Clear existing interceptors to avoid duplicates
    // this.api.interceptors.request.handlers = [];
    const token = this.auth.getToken();

    this.api.interceptors.request.use((config) => {
      config.headers = config.headers || {};
      if (config.data instanceof FormData)
        config.headers["Content-Type"] = "multipart/form-data";
      if (token) config.headers.Authorization = `Bearer ${token}`;
      config.onUploadProgress = this.handleUploadProgress.bind(this);
      return config as InternalAxiosRequestConfig<any>;
    });

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => this.handleResponseError(error)
    );
  }

  public initializeAfterLogin = () => {
    if (this.auth.isAuthenticated()) {
      // At this point after login, this addInterceptors isn't triggered why?
      this.addInterceptors();
    }
  };

  private async handleResponseError(error: any) {
    if (error.response?.status === 401) {
      try {
        const refreshedToken = await this.refreshAuthToken();
        if (!refreshedToken) throw new Error("Token refresh failed");

        // Retry the failed request with a new token
        error.config.headers.Authorization = `Bearer ${refreshedToken}`;
        return this.api.request(error.config);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        this.auth.logout(); // Handle logout on failure
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }

  private async refreshAuthToken(): Promise<string | null> {
    const refreshHashToken = this.auth.getRefreshToken();
    if (!this.tokenPromise) {
      this.tokenPromise = this.api
        .post("api/auth/refresh", {
          refresh_token: refreshHashToken,
        })
        .then((response) => {
          console.log(response);

          const { token, refresh_token, staff } = response.data;
          this.auth.saveToken({ token, refresh_token, staff });
          return token;
        })
        .catch((error) => {
          console.error("Error refreshing token:", error);
          this.tokenPromise = null;
          return null;
        });
    }

    const token = await this.tokenPromise;
    this.tokenPromise = null;
    return token;
  }

  private handleUploadProgress(event: AxiosProgressEvent) {
    const percentCompleted = Math.round(
      (event.loaded * 100) / (event.total || 1)
    );
    this.emitter.emit("uploadProgress", percentCompleted);
  }

  private monitorNetwork(connection: any) {
    console.log("Initial Network Type:", connection.effectiveType);
    connection.addEventListener("change", () => {
      const type = connection.effectiveType;
      const status: NetworkStatus = {
        message: `Network type changed: ${type}`,
        type: type.includes("2g") ? "poor" : "good",
      };
      console.log(status.message);
      this.emitter.emit("networkStatus", status);
    });
  }

  private async measureLatency(): Promise<number> {
    try {
      const start = performance.now();
      await this.api.get("/ping", {
        method: "HEAD",
        headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
      });
      return performance.now() - start;
    } catch (error) {
      console.error("Failed to measure latency:", error);
      return Infinity;
    }
  }

  public startNetworkMonitoring() {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (connection) {
      this.monitorNetwork(connection);
    } else {
      console.log(
        "Network Information API not supported. Falling back to latency measurement."
      );

      const monitorLatency = async () => {
        const latency = await this.measureLatency();
        const status: NetworkStatus =
          latency > 300
            ? {
                message: "High latency detected. Network may be slow.",
                type: "poor",
              }
            : { message: "Network is stable.", type: "good" };
        console.log(status.message);
        this.emitter.emit("networkStatus", status);

        // Adaptive frequency
        this.networkMonitorTimer = setTimeout(
          monitorLatency,
          latency > 300 ? 5000 : 15000
        );
      };

      monitorLatency();
    }
  }

  public stopNetworkMonitoring() {
    if (this.networkMonitorTimer) {
      clearTimeout(this.networkMonitorTimer);
      this.networkMonitorTimer = null;
    }
  }

  /**
   * Subscribe to network status changes.
   */
  onNetworkStatus(callback: (status: NetworkStatus) => void) {
    this.emitter.on("networkStatus", callback);
  }

  offNetworkStatus(callback: (status: NetworkStatus) => void) {
    this.emitter.off("networkStatus", callback);
  }

  async createSession() {
    return await this.api.get("/sanctum/csrf-cookie");
  }

  async fetcher<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(`/api${url}`, {
      responseType: "blob",
    });
  }

  async get<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<AxiosResponse<T>> {
    return this.api.get<T>(`/api/${url}`, params);
  }

  async post<T>(
    url: string,
    data: Record<string, any> | FormData
  ): Promise<AxiosResponse<T>> {
    return this.api.post<T>(`/api/${url}`, data, {
      headers: {
        "Content-Type": this.getDataFormat(data),
      },
    });
  }

  async put<T>(
    url: string,
    data: Record<string, any> | FormData
  ): Promise<AxiosResponse<T>> {
    if (data instanceof FormData) {
      if (!data.has("_method")) {
        data.append("_method", "PUT");
      }

      return this.api.post<T>(`/api/${url}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    return this.api.put<T>(`/api/${url}`, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(`/api/${url}`);
  }

  private getDataFormat(data: Record<string, any> | FormData): string {
    return data instanceof FormData
      ? "multipart-form-data"
      : "application/json";
  }
}
