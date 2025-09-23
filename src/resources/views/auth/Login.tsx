import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "app/Context/ContentContext";
import { getLoggedInUser, loginStaff } from "app/init";
import { AxiosResponse } from "axios";
import { AuthUserResponseData, useAuth } from "app/Context/AuthContext";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import LoginTextInputWithIcon from "../components/forms/LoginTextInputWithIcon";
import CustomButton from "../components/forms/CustomButton";
import CompanyLogo from "../components/pages/CompanyLogo";

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
        const cookieOptions = {
          expires: 7,
          secure: window.location.protocol === "https:", // Only secure on HTTPS
          sameSite: "lax" as const, // Less restrictive for better compatibility
        };

        // Setting cookie with options

        try {
          Cookies.set(
            "user_id",
            staff?.data?.data?.id?.toString(),
            cookieOptions
          );
          // Cookie set successfully
        } catch (cookieError) {
          // Cookie setting failed (possibly incognito mode)
          // Using localStorage fallback for user_id
          localStorage.setItem(
            "user_id",
            staff?.data?.data?.id?.toString() || ""
          );
        }

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
          // defaultPage.path;
          navigate(defaultPage.path);
        } else {
          navigate("/desk/folders");
        }
      }
    } catch (error: any) {
      // Error during login
      // Login failed
    } finally {
      setIsLoading(false);
      setIsAnimating(false);
    }
  };

  return (
    <div className="sign_in_container">
      <div className="flex column gap-md">
        <CompanyLogo />
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
                  isAnimating ? "button-wrapper animating" : "button-wrapper"
                }
              >
                <CustomButton
                  type="submit"
                  label={isLoading ? "" : "Login"}
                  icon={isLoading ? "ri-loader-4-line" : "ri-login-box-line"}
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
  );
};

export default Login;
