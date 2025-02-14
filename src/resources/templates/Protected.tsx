import { ReactNode, useEffect, useState } from "react";
import "../assets/css/app.css";
import { useLocation, useNavigate } from "react-router-dom";
import CompanyLogo from "../../resources/views/components/pages/CompanyLogo";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CircularMenu from "resources/views/components/menu/CircularMenu";
import { useStateContext } from "app/Context/ContentContext";
import { useAuth } from "app/Context/AuthContext";
import Aside from "resources/views/components/partials/Aside";
import { ModalProvider } from "app/Context/ModalContext";
import ModalPage from "resources/views/pages/ModalPage";

export interface ProtectedProps {
  children: ReactNode;
}

const Protected = ({ children }: ProtectedProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { apps, navigation } = useStateContext();
  const { logout } = useAuth();

  const [dashboard, setDashboard] = useState<string>("");
  const [activePage, setActivePage] = useState<string>("");

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  useEffect(() => {
    if (pathname !== "") {
      const pageName = pathname.split("/");
      const appPath = pageName[1];
      const pagePath = pageName.length > 2 ? `/${appPath}/${pageName[2]}` : "";
      setDashboard(`/${appPath}`);
      setActivePage(pagePath !== "" ? pagePath : `/${appPath}`);
    }
  }, [pathname]);

  return (
    <ModalProvider>
      <div id="main-wrapper">
        <Aside
          navigation={navigation}
          dashboard={dashboard}
          handleLogout={handleLogout}
          activePath={activePage}
        />
        <main id="content">
          <header id="portal-header">
            <div className="portal-header__inner">
              <div id="company-logo">
                <CompanyLogo color="primary" text />
              </div>
              <div id="profile-area">
                <div className="app-dropdown">
                  <i className="ri-apps-line" />
                </div>
                <i className="ri-notification-2-line" />
                <i className="ri-mail-line" />
                <div className="profile-area__inner">
                  <h2>Ekaro Bobby</h2>
                  <small>Administrator</small>
                </div>
              </div>
            </div>
          </header>
          <div className="main-content">
            <div className="container-fluid">
              <div className="row">{children}</div>
            </div>
          </div>
          {/* Menu Section */}
          <div id="circular-menu-container">
            <CircularMenu lists={apps} />
          </div>
        </main>
      </div>
      <ModalPage />
      <ToastContainer />
    </ModalProvider>
  );
};

export default Protected;
