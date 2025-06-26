import "remixicon/fonts/remixicon.css";
import Main from "./bootstrap";
import "animate.css";
import React from "react";
import { useStateContext } from "app/Context/ContentContext";
import Aside from "resources/views/components/partials/Aside";
import { useAuth } from "app/Context/AuthContext";
import { LoaderProvider } from "app/Context/LoaderProvider";

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
    <LoaderProvider>
      <div id={`${staff ? "wrapper" : "login-wrapper"}`}>
        {staff && <MemoizedSidebar />}
        <Main />
      </div>
    </LoaderProvider>
  );
};

export default App;
