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
import PerformanceDebugger from "./components/PerformanceDebugger";

const App = () => {
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

  return (
    // <div className="debug-grid">
    //   <Main />
    // </div>
    <ThemeProvider>
      <LoaderProvider>
        <RequestManagerProvider batchDelay={100} maxBatchSize={8}>
          <ResourceProvider>
            <div id={`${staff ? "wrapper" : "login-wrapper"}`}>
              {staff && <MemoizedSidebar />}
              <Main />
              <PerformanceDebugger />
            </div>
          </ResourceProvider>
        </RequestManagerProvider>
      </LoaderProvider>
    </ThemeProvider>
  );
};

export default App;
