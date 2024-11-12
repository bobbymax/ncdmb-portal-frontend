import { UserResponseData } from "../Repositories/UserRepository";

export class AuthProvider {
  private key = "authToken";

  public isAuthenticated = (): boolean => {
    return !!localStorage.getItem(this.key);
  };

  public saveToken = (data: any): void => {
    localStorage.setItem(this.key, JSON.stringify(data));
  };

  private getStorageData = (): {
    token: string;
    staff: UserResponseData;
  } | null => {
    const data = localStorage.getItem(this.key);
    if (!data) {
      return null;
    }

    const parsed: { token: string; staff: UserResponseData } = JSON.parse(data);
    return parsed;
  };

  public getAuthenticatedUser = (): UserResponseData | null => {
    return this.getStorageData()?.staff as UserResponseData;
  };

  public getToken = (): string | null => {
    return this.getStorageData()?.token as string;
  };

  // Log out by removing the token
  public logout(): void {
    localStorage.removeItem(this.key);
  }
}
