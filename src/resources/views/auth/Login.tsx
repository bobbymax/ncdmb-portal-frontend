import { FormEvent, useState } from "react";
import Button from "../components/forms/Button";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "app/Context/ContentContext";
import { getLoggedInUser, loginStaff } from "app/init";
import { AxiosResponse } from "axios";
import { AuthUserResponseData, useAuth } from "app/Context/AuthContext";
import Cookies from "js-cookie";
import NewBrandLogo from "../components/pages/NewBrandLogo";
import { Link } from "react-router-dom";
import LoginTextInputWithIcon from "../components/forms/LoginTextInputWithIcon";
import ParticlesBackground from "../components/ParticlesBackground";
import CustomButton from "../components/forms/CustomButton";

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

        // console.log(staff.data.data);

        if (defaultPage) {
          // defaultPage.path;
          navigate("/desk/folders");
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
      <ParticlesBackground />
      <div className="login__card">
        <div className="flex column gap-md">
          {/* <CompanyLogo color="primary" text /> */}
          <NewBrandLogo />
          <div className="mb-4"></div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <LoginTextInputWithIcon
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  size="md"
                  icon="user-5"
                  width={100}
                />
              </div>
              <div className="col-md-12 mb-5">
                <LoginTextInputWithIcon
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="md"
                  icon="lock-password"
                  width={100}
                />
              </div>

              <div className="col-md-12 mb-4">
                <CustomButton
                  type="submit"
                  label="Login"
                  icon="ri-login-box-line"
                  variant="success"
                  size="md"
                />
              </div>
              <div className="col-md-12">
                <Link to="#" className="password-forgot flex align end">
                  Forgot Password?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
