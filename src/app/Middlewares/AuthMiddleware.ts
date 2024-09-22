import { AuthProvider } from "@providers/AuthProvider";

export const AuthMiddleware = (next: Function) => {
  const authProvider = new AuthProvider();

  if (!authProvider.isAuthenticated()) {
    throw new Error("Not authenticated");
  }

  return next();
};
