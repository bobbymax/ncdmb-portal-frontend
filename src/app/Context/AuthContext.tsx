import React, { createContext, useEffect, useState } from "react";
import { ApiService } from "app/Services/ApiService";
import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { UserResponseData } from "app/Repositories/User/data";

export interface AuthState {
  staff: UserResponseData | null;
  refresh_token: string | null;
  token: string | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<AuthState>;
  logout: () => void;
  refreshToken: () => Promise<AuthState | undefined>;
  updateAuthenticatedUser: (user: UserResponseData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = "authToken";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    staff: null,
    refresh_token: null,
    token: null,
  });

  const apiService = new ApiService();

  useEffect(() => {
    const storedData = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedData) {
      try {
        const parsedData: AuthState = JSON.parse(storedData);
        if (parsedData?.staff && parsedData?.token) {
          setAuthState(parsedData);
        }
      } catch (error) {
        console.error("Failed to parse stored auth token", error);
      }
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<AuthState> => {
    try {
      const response: AxiosResponse<{ data: AuthState }> =
        await apiService.post("login", {
          username,
          password,
        });
      const data = response.data.data;
      if (data && data.token) {
        setAuthState(data);
        localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(data));
      }

      return data as AuthState;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    apiService.post("logout", {}); // Optionally inform backend
    setAuthState({ staff: null, refresh_token: null, token: null });
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const refreshToken = async () => {
    const storedData = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedData) {
      const parsedData: AuthState = JSON.parse(storedData);
      const response = await apiService.post("api/auth/refresh", {
        refresh_token: parsedData.refresh_token,
      });
      const data = response.data;
      if (data) {
        setAuthState(data as AuthState);
        localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(data));
      }

      return data as AuthState;
    }
  };

  const updateAuthenticatedUser = (staff: UserResponseData) => {
    setAuthState((prevState) => ({
      ...prevState,
      staff,
    }));
    localStorage.setItem(
      AUTH_TOKEN_KEY,
      JSON.stringify({ ...authState, staff })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
        refreshToken,
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
