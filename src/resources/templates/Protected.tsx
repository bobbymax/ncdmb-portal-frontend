import { ReactNode } from "react";
import "../assets/css/app.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ModalProvider } from "app/Context/ModalContext";
import ModalPage from "resources/views/pages/ModalPage";
import { useAuth } from "app/Context/AuthContext";
import Button from "resources/views/components/forms/Button";
import avatar from "../assets/images/avatars/profile_picture.webp";
import { useNavigate } from "react-router-dom";
import PageLoader from "resources/views/components/loaders/PageLoader";

export interface ProtectedProps {
  children: ReactNode;
}

const Protected = ({ children }: ProtectedProps) => {
  const { staff, logout } = useAuth();
  const navigate = useNavigate();

  const logoutUser = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <ModalProvider>
      <main id="content">
        <header className="main__top__header flex align between">
          <div className="salutation flex align gap-md">
            <div className="custom__avatar">
              <img src={avatar} alt="An Avatar" />
            </div>
            <div className="staff__name flex column">
              <small>Good Afternoon,</small>
              <h1>{staff?.name}</h1>
            </div>
          </div>
          <div className="notification-manager flex align gap-xl">
            <i className="topheadericon ri-user-settings-line" />
            <i className="topheadericon ri-notification-2-line" />
            <Button
              icon="ri-switch-line"
              handleClick={() => logoutUser()}
              variant="danger"
              size="sm"
              label="Logout"
            />
          </div>
        </header>
        <div className="main-content">
          <div className="container-fluid">
            <div className="row">{children}</div>
          </div>
        </div>
      </main>
      <PageLoader />
      <ModalPage />
      <ToastContainer />
    </ModalProvider>
  );
};

export default Protected;
