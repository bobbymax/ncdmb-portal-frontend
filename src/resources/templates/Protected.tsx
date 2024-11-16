/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode, useEffect, useState } from "react";
import "../assets/css/app.css";
import avatar from "../assets/images/avatar.png";
import moment from "moment";
import { Link, useLocation } from "react-router-dom";
import CompanyLogo from "../../resources/views/components/pages/CompanyLogo";
import { useStateContext } from "app/Context/ContentContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TextInputWithIcon from "resources/views/components/forms/TextInputWithIcon";

export interface ProtectedProps {
  children: ReactNode;
}

const Protected = ({ children }: ProtectedProps) => {
  const { navigation } = useStateContext();
  const { pathname } = useLocation();

  const [search, setSearch] = useState("");
  const [isToggled, setIsToggled] = useState(false);
  const [isMenuToggled, setIsMenuToggled] = useState(false);

  useEffect(() => {
    if (isToggled && isMenuToggled) {
      setIsMenuToggled(false);
    }
  }, [isMenuToggled, isToggled]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      const range = window.innerWidth > 800 && window.innerWidth < 1280;

      if (range && !isToggled) {
        setIsMenuToggled(true);
      } else if (!range && isMenuToggled) {
        setIsMenuToggled(false);
      }
    });

    return () => {
      window.removeEventListener("resize", () => {
        setIsMenuToggled(false);
      });
    };
  }, [isMenuToggled, isToggled]);

  return (
    <>
      <div id="wrapper">
        <aside
          className={`sidebar-container ${
            isMenuToggled ? "sidebar-close" : ""
          }`}
        >
          <div className="sidebar">
            {/* Logo Area */}
            <div className="logo-area">
              <CompanyLogo color="secondary" text={!isMenuToggled} />
            </div>

            <nav id="navigation-bar">
              <ul>
                <li>
                  <Link to="/" className="active">
                    <i className="ri-dashboard-horizontal-line" />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link to="/users">
                    <i className="ri-government-line" />
                    <span>Budget</span>
                  </Link>
                </li>
                <li>
                  <Link to="/users">
                    <i className="ri-store-3-line" />
                    <span>Inventory</span>
                  </Link>
                </li>
                <li>
                  <button
                    className="dropdown-btn"
                    onClick={() => setIsToggled(!isToggled)}
                  >
                    <i className="ri-bus-2-line" />
                    <span>Fleets</span>
                    <i
                      className={`ri-arrow-down-s-line big-screen ${
                        isToggled ? "rotate" : ""
                      }`}
                    />
                    <div className="dot"></div>
                  </button>
                  <ul className={`sub-menu ${isToggled ? "show" : ""}`}>
                    <div>
                      <li>
                        <Link to="#">Work</Link>
                      </li>
                      <li>
                        <Link to="#">Document</Link>
                      </li>
                      <li>
                        <Link to="#">Project</Link>
                      </li>
                      <li>
                        <Link to="#">Plaster</Link>
                      </li>
                      <li>
                        <Link to="#">Hommer</Link>
                      </li>
                      <li>
                        <Link to="#">Divinity</Link>
                      </li>
                    </div>
                  </ul>
                </li>
                <li>
                  <Link to="/users">
                    <i className="ri-store-3-line" />
                    <span>Inventory</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </aside>
        <main id="content">
          <header className="main-header">
            <div className="main-header__inner flex align between gap-xxl">
              <div className="main-header__left">
                <i
                  className={`ri-menu-3-line ${isMenuToggled ? "rotate" : ""}`}
                  id="menu-toggle-bttn"
                  onClick={() => {
                    if (isToggled) {
                      setIsToggled(false);
                    }
                    setIsMenuToggled(!isMenuToggled);
                  }}
                />
              </div>
              <div className="main-header__right gap-xxl">
                <div style={{ flexGrow: 1, width: "100%" }}>
                  <TextInputWithIcon
                    icon="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Here"
                    width={100}
                  />
                </div>
                <div className="right__icons">
                  <i className="ri-notification-line" />
                  <i className="ri-settings-2-line" />
                  <div className="profile-badge flex align gap-md">
                    <i className="ri-user-line" />
                    <div
                      className="user-name flex column"
                      style={{
                        lineHeight: 1.1,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 400,
                          letterSpacing: 1,
                          fontSize: 19,
                        }}
                      >
                        Ekaro, Adiah
                      </span>
                      <small
                        style={{
                          textTransform: "uppercase",
                          fontSize: 9,
                          letterSpacing: 4,
                        }}
                      >
                        Administrator
                      </small>
                    </div>
                  </div>
                  <i className="ri-logout-box-r-line logout-box" />
                </div>
              </div>
            </div>
          </header>
          <div className="main-content">
            <div className="row">
              <div className="container-fluid">{children}</div>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </>
  );
};

export default Protected;
