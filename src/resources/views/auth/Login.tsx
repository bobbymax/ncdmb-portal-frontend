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
import TwoFactorChallenge from "../components/Auth/TwoFactorChallenge";

const Login = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setStaff } = useAuth();
  const { setPages, setRole, setApps, setGroups, setRemunerations } =
    useStateContext();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState<number>(0);
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
      const loginResponse = await loginStaff({ username, password });

      // Check if 2FA is required
      if (loginResponse.data?.requires_2fa) {
        setRequires2FA(true);
        setUserId(loginResponse.data.user_id);
        setIsLoading(false);
        setIsAnimating(false);
        return;
      }

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

  // Complete login after 2FA verification
  const handleTwoFactorSuccess = async () => {
    try {
      const staff: AxiosResponse<{ data: AuthUserResponseData }> =
        await getLoggedInUser();

      if (staff && staff.data && staff.data.data) {
        // Save user ID in cookies
        const cookieOptions = {
          expires: 7,
          secure: window.location.protocol === "https:",
          sameSite: "lax" as const,
        };

        try {
          Cookies.set("user_id", staff.data.data.id.toString(), cookieOptions);
        } catch (cookieError) {
          localStorage.setItem("user_id", staff.data.data.id.toString());
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

        // Navigate to default page or dashboard
        const defaultPage = pages.find(
          (page) => page.id === staff.data.data.default_page_id
        );

        if (defaultPage && defaultPage.path) {
          navigate(defaultPage.path);
        } else {
          navigate("/desk/folders");
        }
      }
    } catch (error) {
      console.error("Error completing login after 2FA:", error);
      // Force navigation on error as fallback
      navigate("/desk/folders");
    }
  };

  // If 2FA is required, show the challenge
  if (requires2FA) {
    return (
      <TwoFactorChallenge
        userId={userId}
        onSuccess={handleTwoFactorSuccess}
        onCancel={() => {
          setRequires2FA(false);
          setUserId(0);
          setPassword("");
        }}
      />
    );
  }

  return (
    <div className="sign_in_container">
      <div className="login-form-card">
        <CompanyLogo />

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
