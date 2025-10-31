import "remixicon/fonts/remixicon.css";
import Main from "./bootstrap";
import "animate.css";
import React from "react";
import { useStateContext } from "app/Context/ContentContext";
import Aside from "resources/views/components/partials/Aside";
import { useAuth } from "app/Context/AuthContext";
import { LoaderProvider } from "app/Context/LoaderProvider";
import { ThemeProvider } from "app/Context/ThemeContext";
import { RequestManagerProvider } from "app/Context/RequestManagerContext";
import { ResourceProvider } from "app/Context/ResourceContext";
import { ErrorProvider } from "app/Context/ErrorContext";
import { useNetworkStatus } from "app/Hooks/useNetworkStatus";
import PerformanceDebugger from "./components/PerformanceDebugger";

const AppContent = () => {
  const { staff } = useAuth();
  const MemoizedSidebar = React.memo(() => {
    const { pages, dashboard, activePage } = useStateContext();
    const { logout } = useAuth();
    return (
      <Aside
        navigation={pages}
        dashboard={dashboard}
        handleLogout={logout}
        activePath={activePage}
      />
    );
  });

  // Monitor network status
  useNetworkStatus();

  return (
    <div id={`${staff ? "wrapper" : "login-wrapper"}`}>
      {staff && <MemoizedSidebar />}
      <Main />
      <PerformanceDebugger />
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <ErrorProvider>
        <LoaderProvider>
          <RequestManagerProvider batchDelay={100} maxBatchSize={8}>
            <ResourceProvider>
              <AppContent />
            </ResourceProvider>
          </RequestManagerProvider>
        </LoaderProvider>
      </ErrorProvider>
    </ThemeProvider>
  );
};

export default App;
