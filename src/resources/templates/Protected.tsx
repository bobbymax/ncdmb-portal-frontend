import { ReactNode, useState } from "react";
import "../assets/css/app.css";
import "../assets/css/styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ModalProvider } from "app/Context/ModalContext";
import ModalPage from "resources/views/pages/ModalPage";
import { useAuth } from "app/Context/AuthContext";
import Button from "resources/views/components/forms/Button";
import avatar from "../assets/images/avatars/profile_picture.webp";
import { useNavigate } from "react-router-dom";
import PageLoader from "resources/views/components/loaders/PageLoader";
import ThemeToggle from "resources/views/components/ThemeToggle";

export interface ProtectedProps {
  children: ReactNode;
}

const Protected = ({ children }: ProtectedProps) => {
  const { staff, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoutUser = () => {
    logout();
    navigate("/auth/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Toggle sidebar visibility
    const sidebar = document.getElementById("sidebar-wrapper");
    if (sidebar) {
      sidebar.classList.toggle("sidebar-open");
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileMenuOpen(false);
    const sidebar = document.getElementById("sidebar-wrapper");
    if (sidebar) {
      sidebar.classList.remove("sidebar-open");
    }
  };

  return (
    <ModalProvider>
      {/* Sidebar Overlay for Mobile */}
      <div
        className={`sidebar-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileSidebar}
      />

      {/* Right Layout */}
      <main id="content">
        {/* Top Header */}
        <header className="main__top__header flex align between">
          <div className="header-left flex align gap-md">
            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <i className="ri-menu-line" />
            </button>
            <div className="search-container">
              <div className="search-input-wrapper">
                <i className="ri-search-line" />
                <input
                  type="text"
                  placeholder="Search (Ctrl+/)"
                  className="search-input"
                />
              </div>
            </div>
          </div>
          <div className="header-right flex align gap-xl">
            <i className="topheadericon ri-code-s-slash-line" />
            <ThemeToggle />
            <i className="topheadericon ri-grid-line" />
            <i className="topheadericon ri-notification-2-line" />
            <div className="profile-section flex align gap-md">
              <div className="profile-avatar">
                <img src={avatar} alt="Profile" />
                <div className="profile-status-indicator"></div>
              </div>
              <div className="profile-info">
                <div className="profile-greeting">
                  <small>Good Afternoon,</small>
                </div>
                <div className="profile-name">
                  <h3>{staff?.name}</h3>
                </div>
                <div className="profile-role">
                  <span>Administrator</span>
                </div>
              </div>
              <div className="profile-actions">
                <i className="ri-arrow-down-s-line profile-dropdown-icon" />
              </div>
            </div>
            <Button
              icon="ri-switch-line"
              handleClick={() => logoutUser()}
              variant="danger"
              size="sm"
              label="Logout"
            />
          </div>
        </header>
        {/* End Top Header */}

        {/* Main Content */}
        <div className="main-content">
          <div className="container-fluid">
            <div className="row">{children}</div>
          </div>
        </div>
        {/* End Main Content */}
      </main>
      <PageLoader />
      <ModalPage />
      <ToastContainer />
    </ModalProvider>
  );
};

export default Protected;
