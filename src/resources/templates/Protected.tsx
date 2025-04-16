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
import SpaceMenu from "resources/views/components/partials/SpaceMenu";
import { Link } from "react-router-dom";

export interface ProtectedProps {
  children: ReactNode;
}

const Protected = ({ children }: ProtectedProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { apps, navigation } = useStateContext();
  const { logout, staff } = useAuth();

  const [dashboard, setDashboard] = useState<string>("");
  const [activePage, setActivePage] = useState<string>("");
  const [navIsOpen, setNavIsOpen] = useState(false);
  const [dropdownState, setDropdownState] = useState<
    "open" | "closed" | "closing"
  >("closed");

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const toggleNav = () => {
    if (dropdownState === "open") {
      setDropdownState("closing");
      setTimeout(() => setDropdownState("closed"), 300); // match pullUp duration
    } else {
      setDropdownState("open");
    }
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

  useEffect(() => {
    setDropdownState("closed");
    setNavIsOpen(false);
  }, [activePage]);

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
              <div id="company-logo" className="flex align gap-md">
                <CompanyLogo color="primary" text />
                {/* Handle Dropdown Here */}
                {/* Applications Menu */}
                <nav className="applications">
                  <SpaceMenu
                    apps={apps}
                    toggleNav={toggleNav}
                    dropDownState={dropdownState}
                  />
                </nav>
              </div>
              <div id="profile-area">
                <div className="app-dropdown">
                  <i className="ri-apps-line" />
                </div>
                <i className="ri-notification-2-line" />
                <i className="ri-mail-line" />
                <div className="profile-area__inner">
                  <h2>{staff?.name}</h2>
                  <small>{staff?.role?.name}</small>
                </div>
              </div>
            </div>
          </header>

          {dropdownState === "open" && (
            <section className="dropdown__menu__custom bounce-in">
              <div className="menu__items">
                <div className="row">
                  {apps.map((item, i) => (
                    <div className="col-md-4 mb-5" key={i}>
                      <Link
                        to={item.path}
                        className="menu__link flex align gap-md"
                      >
                        <img
                          src={item.image_path}
                          style={{
                            filter:
                              item.path === activePage
                                ? "grayscale(0%)"
                                : "grayscale(100%)",
                          }}
                          alt="App Logo"
                        />
                        <span>{item.name}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              <div className="menu__description__section"></div>
            </section>
          )}

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
