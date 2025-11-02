/* eslint-disable react-hooks/exhaustive-deps */
import { Navigate, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import Protected from "resources/templates/Protected";
import { useStateContext } from "app/Context/ContentContext";
import MenuProvider from "app/Providers/MenuProvider";
import { useAuth } from "app/Context/AuthContext";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isCheckingSession } = useAuth();
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

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ fontSize: '3rem', color: '#137547' }}>
          <i className="ri-loader-4-line spinning"></i>
        </div>
        <p style={{ color: '#666', fontSize: '1rem', fontWeight: '500' }}>Verifying session...</p>
      </div>
    );
  }

  return isAuthenticated ? (
    <Protected>{children}</Protected>
  ) : (
    <Navigate to="/auth/login" replace />
  );
};
