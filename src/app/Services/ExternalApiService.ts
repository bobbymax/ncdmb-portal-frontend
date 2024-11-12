import { AuthProvider } from "app/Providers/AuthProvider";
import axios, { AxiosInstance, AxiosResponse } from "axios";

export class ExternalApiService {
  private api: AxiosInstance;
  public url: string;
  private apiKey: string;
  private auth: AuthProvider;

  constructor(url: string, apiKey: string) {
    this.auth = new AuthProvider();
    this.url = url;
    this.apiKey = apiKey;
    this.api = axios.create({
      baseURL: url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  async collect<T>(): Promise<AxiosResponse<T>> {
    const params: Record<string, any> = { apiKey: this.apiKey };
    const staffUser = this.auth.getAuthenticatedUser()?.staff_no;
    if (staffUser) {
      params.staff = staffUser;
    }

    return this.api.get<T>("", { params });
  }
}
