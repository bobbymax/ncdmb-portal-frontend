import { AxiosResponse } from "axios";
import { ApiService } from "./ApiService";
import { AuthProvider } from "../Providers/AuthProvider";

// interface AuthResponse {
//   token: string;
//   user: Record<string, any>;
// }

export class AuthService {
  private api: ApiService;
  private provider: AuthProvider;

  constructor() {
    this.api = new ApiService();
    this.provider = new AuthProvider();
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response: AxiosResponse = await this.api.post("login", {
        username,
        password,
      });

      const { data } = response.data;
      delete data?.message;
      this.provider.saveToken(data);
      return true;
    } catch (error) {
      console.error("Login Failed: ", error);
      return false;
    }
  }
}
