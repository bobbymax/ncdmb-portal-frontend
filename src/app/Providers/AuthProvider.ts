import { AuthState, AuthUserResponseData } from "app/Context/AuthContext";

export class AuthProvider {
  private key = "authToken";

  public isAuthenticated = (): boolean => {
    return !!localStorage.getItem(this.key);
  };

  public saveToken = async (data: AuthState): Promise<void> => {
    localStorage.setItem(this.key, JSON.stringify(data));
  };

  private getStorageData = (): {
    token: string;
    staff: AuthUserResponseData;
    refresh_token: string;
  } | null => {
    const data = localStorage.getItem(this.key);
    if (!data) {
      return null;
    }

    const parsed: {
      token: string;
      staff: AuthUserResponseData;
      refresh_token: string;
    } = JSON.parse(data);
    return parsed;
  };

  public getAuthenticatedUser = (): AuthUserResponseData | null => {
    return this.getStorageData()?.staff as AuthUserResponseData;
  };

  public getToken = (): string | null => {
    return this.getStorageData()?.token as string;
  };

  public getRefreshToken = (): string | null => {
    return this.getStorageData()?.refresh_token as string;
  };

  // Log out by removing the token
  public logout(): void {
    localStorage.removeItem(this.key);
  }
}
