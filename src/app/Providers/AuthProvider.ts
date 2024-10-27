export class AuthProvider {
  private key = "authToken";
  private secretKey = "n14!?<c[aA]3dc@r1!4mb2;:xSWvb";

  public isAuthenticated = (): boolean => {
    return !!localStorage.getItem(this.key);
  };

  public saveToken = (data: any): void => {
    localStorage.setItem(this.key, JSON.stringify(data));
  };

  public getToken = (): string | null => {
    const data = localStorage.getItem(this.key);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  };

  // Log out by removing the token
  public logout(): void {
    localStorage.removeItem(this.key);
  }
}
