import { FormEvent, useState, useEffect } from "react";
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
import { useErrors } from "app/Context/ErrorContext";
import { ValidationError } from "app/Errors/AppErrors";

const Login = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setStaff, isAuthenticated } = useAuth();
  const { setPages, setRole, setApps, setGroups, setRemunerations } =
    useStateContext();
  const { handleError } = useErrors();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/insights", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

      // CRITICAL FIX: Set user_id cookie BEFORE calling getLoggedInUser
      // This ensures the identity marker is valid for all subsequent requests
      const userId = loginResponse.data?.user_id || 
                     loginResponse.data?.data?.user_id || 
                     loginResponse.data?.data?.id;
      
      if (userId) {
        const cookieOptions = {
          expires: 7,
          secure: window.location.protocol === "https:",
          sameSite: "lax" as const,
        };

        try {
          Cookies.set("user_id", userId.toString(), cookieOptions);
        } catch (cookieError) {
          localStorage.setItem("user_id", userId.toString());
        }
      }

      // NOW fetch user details with valid identity marker
      const staff: AxiosResponse<{ data: AuthUserResponseData }> =
        await getLoggedInUser();

      if (staff) {
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

        navigate("/insights");
      }
    } catch (error: any) {
      // Handle login error with proper user feedback
      handleError(
        error,
        {
          component: "Login",
          action: "authentication",
        },
        {
          showToast: true,
          silent: false,
        }
      );

      // Set error message for display
      if (error instanceof ValidationError) {
        setLoginError("Please check your username and password.");
      } else {
        setLoginError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setIsAnimating(false);
    }
  };

  // Complete login after 2FA verification
  const handleTwoFactorSuccess = async () => {
    try {
      // CRITICAL FIX: Set user_id cookie BEFORE calling getLoggedInUser
      // The user_id should already be set during 2FA, but ensure it's set
      if (userId) {
        const cookieOptions = {
          expires: 7,
          secure: window.location.protocol === "https:",
          sameSite: "lax" as const,
        };

        try {
          Cookies.set("user_id", userId.toString(), cookieOptions);
        } catch (cookieError) {
          localStorage.setItem("user_id", userId.toString());
        }
      }

      // NOW fetch user details with valid identity marker
      const staff: AxiosResponse<{ data: AuthUserResponseData }> =
        await getLoggedInUser();

      if (staff && staff.data && staff.data.data) {

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
      handleError(
        error,
        {
          component: "Login",
          action: "2FA completion",
        },
        {
          showToast: true,
          silent: false,
        }
      );
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

        {loginError && (
          <div
            className="alert alert-danger"
            style={{
              marginBottom: "1.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i className="ri-error-warning-line"></i>
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-12 mb-3">
              <LoginTextInputWithIcon
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setLoginError(""); // Clear error when user starts typing
                }}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError(""); // Clear error when user starts typing
                }}
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
