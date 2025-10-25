import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { ApiService } from "app/Services/ApiService";
import { AxiosResponse } from "axios";
import { RoleResponseData } from "app/Repositories/Role/data";
import { AuthPageResponseData } from "app/Repositories/Page/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";
import { getLoggedInUser } from "app/init";
import { CarderResponseData } from "app/Repositories/Carder/data";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { GradeLevelResponseData } from "../Repositories/GradeLevel/data";
import TokenProvider from "lib/TokenProvider";
import { useResourceContext } from "./ResourceContext";
import { AuthProvider as AuthProviderClass } from "../Providers/AuthProvider";

export type AuthUserResponseData = {
  id: number;
  name: string;
  staff_no: string;
  grade_level_id: number;
  department_id: number;
  department?: DataOptionsProps | null;
  location_id: number;
  carder: CarderResponseData;
  avatar: string;
  email: string;
  password?: string;
  is_logged_in?: boolean;
  role: RoleResponseData | null;
  pages: AuthPageResponseData[];
  groups: GroupResponseData[];
  default_page_id: number;
  remunerations: RemunerationResponseData[];
  grade_level_object: GradeLevelResponseData | null;
};

export interface AuthState {
  staff: AuthUserResponseData | null;
  refresh_token?: string | null;
  token?: string | null;
}

interface AuthContextType {
  staff: AuthUserResponseData | undefined;
  setStaff: Dispatch<SetStateAction<AuthUserResponseData | undefined>>;
  authState: AuthState;
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  logout: () => void;
  updateAuthenticatedUser: (user: AuthUserResponseData) => void;
  getUser: () => { id: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const apiService = new ApiService();

  const [authState, setAuthState] = useState<AuthState>({
    staff: null,
    refresh_token: null,
    token: null,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staff, setStaff] = useState<AuthUserResponseData | undefined>();
  const getUser = () => (staff ? { id: staff.id.toString() } : null);

  // const apiService = new ApiService();

  const fetchUser = async () => {
    try {
      const response: AxiosResponse<{ data: AuthUserResponseData | null }> =
        await getLoggedInUser();
      if (response && response.data.data) {
        setStaff(response.data.data);
        setIsAuthenticated(true);
      } else {
        // Session invalid or no user data
        setIsAuthenticated(false);
        setStaff(undefined);
        setAuthState({ staff: null, token: null, refresh_token: null });
      }
    } catch (error) {
      // Session expired or network error
      setIsAuthenticated(false);
      setStaff(undefined);
      setAuthState({ staff: null, token: null, refresh_token: null });
      // Clear token
      TokenProvider.getInstance().clearToken();
    }
  };

  // Logout Function
  const logout = async () => {
    try {
      await apiService.post("logout", {});
    } catch (error) {
      // Logout API call failed, but still clear local state
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear state regardless of API call success
      setAuthState({ staff: null, token: null, refresh_token: null });
      setStaff(undefined);
      setIsAuthenticated(false);
      // Clear token from TokenProvider
      TokenProvider.getInstance().clearToken();

      // Also clear localStorage auth token
      const authProviderInstance = new AuthProviderClass();
      authProviderInstance.logout();
    }
  };

  const updateAuthenticatedUser = (staff: AuthUserResponseData) => {
    setAuthState((prevState) => ({
      ...prevState,
      staff,
    }));
  };

  // reference here
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchUser();
      }, 30 * 60 * 1000); // 5 minutes in milliseconds

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        staff,
        setStaff,
        authState,
        isAuthenticated,
        setIsAuthenticated,
        logout,
        updateAuthenticatedUser,
        getUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
