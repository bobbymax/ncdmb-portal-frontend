import { ReactNode } from "react";
import "../assets/css/app.css";
import avatar from "../assets/images/avatar.png";
import moment from "moment";
import { Link, useLocation } from "react-router-dom";
import CompanyLogo from "../../resources/views/components/pages/CompanyLogo";
import { useStateContext } from "app/Context/ContentContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export interface ProtectedProps {
  children: ReactNode;
}

const Protected = ({ children }: ProtectedProps) => {
  const { navigation } = useStateContext();
  const { pathname } = useLocation();

  return (
    <>
      <div id="wrapper">
        <section className="top-strip"></section>
        <header className="main-menu">
          <div className="navigation-container flex align between">
            <CompanyLogo color="secondary" />
            <div className="right-side flex align gap-xl">
              <nav className="custom-nav flex align gap-md">
                {navigation.map((nav, i) => (
                  <Link
                    key={i}
                    to={nav.path}
                    className={`link-item flex align gap-sm ${
                      pathname === nav.path ? "active" : ""
                    }`}
                  >
                    <i className={nav.icon} />
                    <span>{nav.name}</span>
                  </Link>
                ))}
              </nav>
              <i className="ri-notification-4-fill top-icon" />
              <div className="profile-card flex align gap-md">
                <img
                  src={avatar}
                  style={{ width: 38 }}
                  alt="Profile Staff Profile"
                />
                <div className="profile-info">
                  <h3 className="profile-name">John Doe</h3>
                  <small className="role">System Administrator</small>
                </div>
              </div>
              <i className="ri-logout-box-line logout-icon" />
            </div>
          </div>
        </header>
        <main id="content">
          <div className="container-fluid">{children}</div>
        </main>
        <footer className="footer">
          <p>Powered by NCDMB ICT Division {moment().year()}</p>
        </footer>
      </div>
      <div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Protected;
