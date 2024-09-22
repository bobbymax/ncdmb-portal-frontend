import { Navigate } from "react-router-dom";
import { AuthMiddleware } from "@middlewares/AuthMiddleware";

export const AuthGuard = (next: Function) => {
  try {
    AuthMiddleware(next);
  } catch (error) {
    console.error("Access Denied", error);
    <Navigate to="/login" replace />;
  }
};
