import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { ApiService } from "app/Services/ApiService";
import axios, { AxiosResponse } from "axios";
import { RoleResponseData } from "app/Repositories/Role/data";
import { AuthPageResponseData } from "app/Repositories/Page/data";
import { GroupResponseData } from "app/Repositories/Group/data";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";
import { useStateContext } from "./ContentContext";
import accessPoint from "app/Services";
import { getLoggedInUser } from "app/init";

export type AuthUserResponseData = {
  id: number;
  name: string;
  staff_no: string;
  grade_level_id: number;
  department_id: number;
  location_id: number;
  avatar: string;
  email: string;
  password?: string;
  is_logged_in?: boolean;
  role: RoleResponseData | null;
  pages: AuthPageResponseData[];
  groups: GroupResponseData[];
  default_page_id: number;
  remunerations: RemunerationResponseData[];
};

export interface AuthState {
  staff: AuthUserResponseData | null;
  refresh_token?: string | null;
  token?: string | null;
}

interface ErrorBlock {
  response: {
    data: {
      message: string;
    };
  };
}

interface AuthContextType {
  staff: AuthUserResponseData | undefined;
  setStaff: Dispatch<SetStateAction<AuthUserResponseData | undefined>>;
  authState: AuthState;
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  logout: () => void;
  updateAuthenticatedUser: (user: AuthUserResponseData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    staff: null,
    refresh_token: null,
    token: null,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staff, setStaff] = useState<AuthUserResponseData | undefined>();

  const apiService = new ApiService();

  const fetchUser = async () => {
    try {
      const response: AxiosResponse<{ data: AuthUserResponseData | null }> =
        await getLoggedInUser();
      if (response && response.data.data) {
        setStaff(response.data.data);
      }

      // console.log(response);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  // Logout Function
  const logout = async () => {
    try {
      await apiService.post("logout", {});
      setAuthState({ staff: null, token: null, refresh_token: null });
      setStaff(undefined);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
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
      }, 5 * 60 * 1000); // 5 minutes in milliseconds

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
