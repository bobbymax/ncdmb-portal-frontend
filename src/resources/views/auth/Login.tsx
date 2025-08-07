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
import CustomButton from "../components/forms/CustomButton";

const Login = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setStaff } = useAuth();
  const { setPages, setRole, setApps, setGroups, setRemunerations } =
    useStateContext();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading || isAnimating) return; // Prevent multiple submissions

    setIsAnimating(true);

    // Start the loading state after animation completes
    setTimeout(() => {
      setIsLoading(true);
    }, 1400); // 0.8s shake + 0.6s launch = 1.4s total

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
          navigate(defaultPage.path);
        } else {
          navigate("/desk/folders");
        }
      }
    } catch (error) {
      // Error during login
    } finally {
      setIsLoading(false);
      setIsAnimating(false);
    }
  };

  return (
    <div className="modern-login-container">
      {/* Workspace Background Vectors */}
      <div className="workspace-vectors">
        <div className="vector vector-desk"></div>
        <div className="vector vector-monitor"></div>
        <div className="vector vector-keyboard"></div>
        <div className="vector vector-mouse"></div>
        <div className="vector vector-plant"></div>
        <div className="vector vector-lamp"></div>
        <div className="vector vector-papers"></div>
        <div className="vector vector-coffee"></div>
      </div>

      {/* Centered Form Container */}
      <div className="login-form-container">
        <div className="login-form-card">
          <div className="flex column gap-md">
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
                    isDisabled={isLoading}
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
                    isDisabled={isLoading}
                  />
                </div>

                <div className="col-md-12 mb-4">
                  <div
                    className={
                      isAnimating
                        ? "button-wrapper animating"
                        : "button-wrapper"
                    }
                  >
                    <CustomButton
                      type="submit"
                      label={isLoading ? "" : "Login"}
                      icon={
                        isLoading ? "ri-loader-4-line" : "ri-login-box-line"
                      }
                      variant="success"
                      size="md"
                      isDisabled={isLoading || isAnimating}
                    />
                  </div>
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
      </div>
    </div>
  );
};

export default Login;
