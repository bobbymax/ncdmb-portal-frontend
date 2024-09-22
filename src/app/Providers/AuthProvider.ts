import { AuthService } from "@services/AuthService";

export class AuthProvider {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login(username: string, password: string) {
    return this.authService.login(username, password);
  }

  public logout() {
    return this.authService.logout();
  }

  public isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  public getToken(): string | null {
    return this.authService.getToken();
  }
}
