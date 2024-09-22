import { AxiosResponse } from "axios";
import { ApiService } from "@services/ApiService";

interface AuthResponse {
  token: string;
  user: Record<string, any>;
}

export class AuthService {
  private api: ApiService;
  private key = "authToken";

  constructor() {
    this.api = new ApiService();
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post(
        "login",
        {
          username,
          password,
        }
      );
      const { token } = response.data;
      localStorage.setItem(this.key, token);
      return true;
    } catch (error) {
      console.error("Login Failed: ", error);
      return false;
    }
  }

  isAuthenticated = (): boolean => {
    return !!localStorage.getItem(this.key);
  };

  public saveToken = (token: string): void => {
    localStorage.setItem("authToken", token);
  };

  public getToken = (): string | null => {
    return localStorage.getItem("authToken");
  };

  // Log out by removing the token
  public logout(): void {
    localStorage.removeItem("authToken");
  }
}
