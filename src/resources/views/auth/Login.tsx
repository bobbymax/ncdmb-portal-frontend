import { FormEvent, useState } from "react";
import TextInputWithIcon from "../components/forms/TextInputWithIcon";
import Button from "../components/forms/Button";
import CompanyLogo from "../components/pages/CompanyLogo";
import { AuthService } from "../../../app/Services/AuthService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const authService = new AuthService();

    try {
      const response = await authService.login(username, password);
      if (response) {
        navigate("/");
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
