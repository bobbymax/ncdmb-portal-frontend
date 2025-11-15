import React, { ReactNode, useState, useRef } from "react";
import { createPortal } from "react-dom";
import "../assets/css/app.css";
import "../assets/css/threads.min.css";
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
import DocumentGenerationProgress from "resources/views/components/DocumentGenerationProgress";
import NotificationBell from "resources/views/components/NotificationBell";
import Breadcrumb from "resources/views/components/Breadcrumb";

// Global type declaration for the document progress modal
declare global {
  interface Window {
    showDocumentProgressModal?: (onComplete: () => void) => void;
  }
}

export interface ProtectedProps {
  children: ReactNode;
}

const SIDEBAR_STATE_KEY = "portal:sidebarCollapsed";

const applySidebarCollapsedState = (collapsed: boolean) => {
  const sidebar = document.getElementById("sidebar-wrapper");
  const wrapper = document.getElementById("wrapper");

  if (sidebar) {
    sidebar.classList.toggle("sidebar-collapsed", collapsed);

    if (!collapsed) {
      sidebar.classList.remove("sidebar-open");
    }
  }

  if (wrapper) {
    wrapper.classList.toggle("sidebar-collapsed", collapsed);
  }
};

const Protected = ({ children }: ProtectedProps) => {
  const { staff, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] =
    useState(false);
  const profileButtonRef = useRef<HTMLDivElement>(null);

  // Global modal state for document generation progress
  const [progressModalProps, setProgressModalProps] = useState({
    isOpen: false,
    onClose: () => {},
    onComplete: () => {},
  });

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

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      applySidebarCollapsedState(next);
      localStorage.setItem(SIDEBAR_STATE_KEY, String(next));
      return next;
    });
  };

  const toggleProfileDropdown = () => {
    if (!isProfileDropdownOpen) {
      setIsProfileDropdownOpen(true);
      // Trigger animation after state update
      setTimeout(() => setIsProfileDropdownVisible(true), 10);
    } else {
      setIsProfileDropdownVisible(false);
      // Close after animation completes
      setTimeout(() => setIsProfileDropdownOpen(false), 200);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-section")) {
        setIsProfileDropdownVisible(false);
        setTimeout(() => setIsProfileDropdownOpen(false), 200);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Initialize sidebar state on mount and clean up on unmount
  React.useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STATE_KEY);
    const collapsed = stored === "true";

    setIsSidebarCollapsed(collapsed);
    setIsMobileMenuOpen(false);
    applySidebarCollapsedState(collapsed);

    return () => {
      applySidebarCollapsedState(false);
    };
  }, []);

  // Function to show the progress modal globally
  const showDocumentProgressModal = (onComplete: () => void) => {
    setProgressModalProps({
      isOpen: true,
      onClose: () =>
        setProgressModalProps((prev) => ({ ...prev, isOpen: false })),
      onComplete: () => {
        onComplete();
        setProgressModalProps((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Expose the function globally so other components can use it
  React.useEffect(() => {
    window.showDocumentProgressModal = showDocumentProgressModal;

    // Cleanup function to remove the global function
    return () => {
      delete window.showDocumentProgressModal;
    };
  }, []);

  return (
    <ModalProvider>
      {/* Sidebar Overlay for Mobile */}
      <div
        className={`sidebar-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileSidebar}
      />

      {/* Document Generator Loading Overlay - Positioned at root level */}
      <div
        className="document__generator__loading__overlay"
        style={{ display: "none" }}
      >
        <div className="loading__content">
          <div className="loading__spinner">
            <i className="ri-loader-4-line"></i>
          </div>
          <div className="loading__step">
            <h3>Generating Document</h3>
            <p id="loading-step">Initializing...</p>
          </div>
          <div className="loading__progress">
            <div className="progress__bar">
              <div
                className="progress__fill"
                id="progress-fill"
                style={{ width: "0%" }}
              ></div>
            </div>
            <span className="progress__text" id="progress-text">
              0%
            </span>
          </div>
        </div>
      </div>

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

            {/* Sidebar Toggle Button */}
            <button
              className="sidebar-toggle-btn"
              onClick={toggleSidebar}
              aria-label={
                isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <i
                className={
                  isSidebarCollapsed
                    ? "ri-menu-unfold-line"
                    : "ri-menu-fold-line"
                }
              />
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
            {/* <i className="topheadericon ri-code-s-slash-line" /> */}
            <ThemeToggle />
            {/* <i className="topheadericon ri-grid-line" /> */}
            <NotificationBell />
            <div
              className="profile-section flex align gap-md"
              style={{ position: "relative" }}
            >
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
              <div
                ref={profileButtonRef}
                className="profile-actions"
                onClick={toggleProfileDropdown}
                style={{ cursor: "pointer" }}
              >
                <i
                  className={`ri-arrow-${
                    isProfileDropdownOpen ? "up" : "down"
                  }-s-line profile-dropdown-icon`}
                />
              </div>
            </div>

            {/* Profile Dropdown Menu - Rendered using Portal */}
            {isProfileDropdownOpen &&
              profileButtonRef.current &&
              createPortal(
                <>
                  {/* Backdrop */}
                  <div
                    onClick={() => {
                      setIsProfileDropdownVisible(false);
                      setTimeout(() => setIsProfileDropdownOpen(false), 200);
                    }}
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      backdropFilter: "blur(4px)",
                      zIndex: 9998,
                      opacity: isProfileDropdownVisible ? 1 : 0,
                      transition: "opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                  <div
                    className="profile-dropdown-menu"
                    style={{
                      position: "fixed",
                      top: "70px",
                      right: "20px",
                      backgroundColor: "white",
                      borderRadius: "16px",
                      boxShadow:
                        "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                      minWidth: "240px",
                      zIndex: 9999,
                      overflow: "hidden",
                      opacity: isProfileDropdownVisible ? 1 : 0,
                      transform: isProfileDropdownVisible
                        ? "translateY(0) scale(1)"
                        : "translateY(-10px) scale(0.98)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsProfileDropdownVisible(false);
                        setTimeout(() => {
                          setIsProfileDropdownOpen(false);
                          navigate("/profile-settings");
                        }, 200);
                      }}
                      className="profile-dropdown-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 20px",
                        color: "#1f2937",
                        textDecoration: "none",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                        e.currentTarget.style.paddingLeft = "24px";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.paddingLeft = "20px";
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background:
                            "linear-gradient(135deg, #137547 0%, #0d5233 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <i
                          className="ri-user-settings-line"
                          style={{ color: "white", fontSize: "18px" }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          flex: 1,
                        }}
                      >
                        Profile Settings
                      </span>
                    </a>

                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsProfileDropdownVisible(false);
                        setTimeout(() => {
                          setIsProfileDropdownOpen(false);
                          navigate("/security-settings");
                        }, 200);
                      }}
                      className="profile-dropdown-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 20px",
                        color: "#1f2937",
                        textDecoration: "none",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                        e.currentTarget.style.paddingLeft = "24px";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.paddingLeft = "20px";
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background:
                            "linear-gradient(135deg, #137547 0%, #0d5233 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <i
                          className="ri-shield-check-line"
                          style={{ color: "white", fontSize: "18px" }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          flex: 1,
                        }}
                      >
                        Security
                      </span>
                    </a>

                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsProfileDropdownVisible(false);
                        setTimeout(() => setIsProfileDropdownOpen(false), 200);
                        // Navigate to preferences when ready
                      }}
                      className="profile-dropdown-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 20px",
                        color: "#1f2937",
                        textDecoration: "none",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                        e.currentTarget.style.paddingLeft = "24px";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.paddingLeft = "20px";
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background:
                            "linear-gradient(135deg, #137547 0%, #0d5233 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <i
                          className="ri-settings-3-line"
                          style={{ color: "white", fontSize: "18px" }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          flex: 1,
                        }}
                      >
                        Preferences
                      </span>
                    </a>
                  </div>
                </>,
                document.body
              )}
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

        {/* Breadcrumb Navigation */}
        <div style={{ padding: "0 1.5rem", marginTop: "1rem" }}>
          <Breadcrumb />
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="container-fluid">
            <div className="row">{children}</div>
          </div>
        </div>
        {/* End Main Content */}
      </main>

      {/* Document Generation Progress Modal - Rendered at root level to cover header */}
      <DocumentGenerationProgress
        isOpen={progressModalProps.isOpen}
        onClose={progressModalProps.onClose}
        onComplete={progressModalProps.onComplete}
      />

      <PageLoader />
      <ModalPage />
      <ToastContainer />
    </ModalProvider>
  );
};

export default Protected;
