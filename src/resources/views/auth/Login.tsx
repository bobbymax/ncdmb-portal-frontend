import { FormEvent, useState } from "react";
import TextInputWithIcon from "../components/forms/TextInputWithIcon";
import Button from "../components/forms/Button";
import CompanyLogo from "../components/pages/CompanyLogo";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "app/Context/ContentContext";
import { AuthState, useAuth } from "app/Context/AuthContext";
import { ApiService } from "app/Services/ApiService";

const Login = () => {
  const navigate = useNavigate();
  const { setPages } = useStateContext();
  const { login } = useAuth();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const apiService = new ApiService();

    try {
      const response: AuthState = await login(username, password);
      apiService.initializeAfterLogin();

      if (response && response.staff) {
        const { pages = [] } = response.staff;
        const defaultPage = pages.find(
          (app) =>
            app.type === "app" &&
            response.staff !== null && // Ensure response.staff is not null
            response.staff.default_page_id === app.id
        );

        setPages(pages);
        navigate(`${defaultPage?.path ?? "/"}`);
      } else {
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="custom-card">
        <div className="mb-4 flex column gap-md">
          <CompanyLogo color="primary" text />
          <div className="mb-4"></div>
          <h3 className="resource-header mb-4" style={{ fontWeight: 800 }}>
            Welcome
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-12 mb-4">
                <TextInputWithIcon
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  size="md"
                  icon="ri-user-5-fill"
                  width={100}
                />
              </div>
              <div className="col-md-12 mb-4">
                <TextInputWithIcon
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="md"
                  icon="ri-lock-password-fill"
                  width={100}
                />
              </div>

              <div className="col-md-12">
                <Button
                  type="submit"
                  label="Login"
                  icon="ri-login-box-line"
                  variant="success"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
