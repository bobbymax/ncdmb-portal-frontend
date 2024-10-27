import { Navigate } from "react-router-dom";
import React from "react";
import { AuthProvider } from "../Providers/AuthProvider";
import Protected from "resources/templates/Protected";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const authProvider = new AuthProvider();

  return authProvider.isAuthenticated() ? (
    <Protected>{children}</Protected>
  ) : (
    <Navigate to="/auth/login" replace />
  );
};
