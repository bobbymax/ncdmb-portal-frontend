import { ReactNode } from "react";
import "../assets/css/app.css";
import avatar from "../assets/images/avatar.png";
import moment from "moment";
import { Link } from "react-router-dom";
import CompanyLogo from "../../resources/views/components/pages/CompanyLogo";

export interface ProtectedProps {
  children: ReactNode;
}

const Protected = ({ children }: ProtectedProps) => {
  return (
    <>
      <div id="wrapper">
        <section className="top-strip"></section>
        <header className="main-menu">
          <div className="navigation-container flex align between">
            <CompanyLogo color="secondary" />
            <div className="right-side flex align gap-xl">
              <nav className="custom-nav flex align gap-md">
                <Link to="/users" className="link-item flex align gap-sm">
                  <i className="ri-group-fill" />
                  <span>User Management</span>
                </Link>
                <Link to="#" className="link-item active flex align gap-sm">
                  <i className="ri-service-fill" />
                  <span>Services</span>
                </Link>
                <Link to="#" className="link-item flex align gap-sm">
                  <i className="ri-government-fill" />
                  <span>Modules</span>
                </Link>
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
    </>
  );
};

export default Protected;
