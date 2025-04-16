import { AuthPageResponseData } from "app/Repositories/Page/data";
import { Link } from "react-router-dom";

interface SidebarProps {
  navigation: AuthPageResponseData[];
  dashboard: string;
  activePath: string;
  handleLogout: () => void;
}

const Aside = ({
  dashboard,
  navigation,
  handleLogout,
  activePath,
}: SidebarProps) => {
  return (
    <aside id="sidebar-wrapper">
      <div className="sidebar-box">
        <div id="menu-container">
          <div className="avatar"></div>
        </div>
        <div id="navigation-wrapper">
          <div className="menu-links">
            <Link
              to={dashboard}
              className={`nav-link-item ${
                dashboard === activePath ? "active" : ""
              }`}
              title="Dashboard"
            >
              <i className="ri-dashboard-line" />
              <span className="tooltip">Dashboard</span>
            </Link>
            {navigation.map((nav, i) => (
              <Link
                key={i}
                to={nav.path}
                className={`nav-link-item ${
                  nav.path === activePath ? "active" : ""
                }`}
                title={nav.name}
              >
                <i className={nav.icon} />
                <span className="tooltip">{nav.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div id="logout-nav" onClick={handleLogout}>
          <i className="ri-logout-circle-line" />
        </div>
      </div>
    </aside>
  );
};

export default Aside;
