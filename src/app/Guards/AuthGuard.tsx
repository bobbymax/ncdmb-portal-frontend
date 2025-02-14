/* eslint-disable react-hooks/exhaustive-deps */
import { Navigate, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import Protected from "resources/templates/Protected";
import { useStateContext } from "app/Context/ContentContext";
import MenuProvider from "app/Providers/MenuProvider";
import { useAuth } from "app/Context/AuthContext";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { pages, setApps, setNavigation } = useStateContext();

  const menuProvider = new MenuProvider();
  const { pathname } = useLocation();

  const getRequestedPage = (path: string) => {
    const requested = menuProvider.getRequestedPage(path, pages);

    setApps(menuProvider.applications(pages));
    setNavigation(menuProvider.children(requested?.id ?? 0, pages));
  };

  useEffect(() => {
    if (pages.length > 0 && pathname !== "") {
      getRequestedPage(pathname);
    }
  }, [pages, pathname]);

  return isAuthenticated ? (
    <Protected>{children}</Protected>
  ) : (
    <Navigate to="/auth/login" replace />
  );
};
