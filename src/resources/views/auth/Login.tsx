import { FormEvent, useState } from "react";
import TextInputWithIcon from "../components/forms/TextInputWithIcon";
import Button from "../components/forms/Button";
import CompanyLogo from "../components/pages/CompanyLogo";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "app/Context/ContentContext";
import { getLoggedInUser, loginStaff } from "app/init";
import { AxiosResponse } from "axios";
import { AuthUserResponseData, useAuth } from "app/Context/AuthContext";
import Cookies from "js-cookie";

const Login = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setStaff } = useAuth();
  const { setPages, setRole, setApps, setGroups, setRemunerations } =
    useStateContext();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await loginStaff({ username, password });
      const staff: AxiosResponse<{ data: AuthUserResponseData }> =
        await getLoggedInUser();

      console.log(staff.data.data);

      if (staff) {
        // Save user ID in cookies
        Cookies.set("user_id", staff?.data?.data?.id?.toString(), {
          expires: 7,
          secure: true,
          sameSite: "Strict",
        });

        const {
          pages = [],
          role = null,
          groups = [],
          remunerations = [],
        } = staff.data.data;

        setApps(pages.filter((page) => page.type === "app"));
        setPages(pages);
        setRole(role);
        setGroups(groups);
        setRemunerations(remunerations);
        setIsAuthenticated(true);
        setStaff(staff.data.data);

        const defaultPage = pages.find(
          (page) => page.id === staff.data.data.default_page_id
        );

        if (defaultPage) {
          navigate(defaultPage.path);
        } else {
          console.log("Default Page not found");
        }
      }
    } catch (error) {
      console.log(error);
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
