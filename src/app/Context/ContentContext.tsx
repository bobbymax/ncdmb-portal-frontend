/* eslint-disable react-hooks/exhaustive-deps */
import { AuthPageResponseData } from "app/Repositories/Page/data";
import { createContext, useContext, useEffect, useState } from "react";
import { ProtectedProps } from "resources/templates/Protected";
import { AuthState, useAuth } from "./AuthContext";
import { GroupResponseData } from "app/Repositories/Group/data";
import { RoleResponseData } from "app/Repositories/Role/data";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";
import {
  SettingResponseData,
  SettingInputDataType,
} from "app/Repositories/Setting/data";
import { useLocation } from "react-router-dom";
import SettingRepository from "app/Repositories/Setting/SettingRepository";

interface StateContextType {
  apps: AuthPageResponseData[];
  setApps: React.Dispatch<React.SetStateAction<AuthPageResponseData[]>>;
  navigation: AuthPageResponseData[];
  setNavigation: React.Dispatch<React.SetStateAction<AuthPageResponseData[]>>;
  pages: AuthPageResponseData[];
  setPages: React.Dispatch<React.SetStateAction<AuthPageResponseData[]>>;
  groups: GroupResponseData[];
  setGroups: React.Dispatch<React.SetStateAction<GroupResponseData[]>>;
  remunerations: RemunerationResponseData[];
  setRemunerations: React.Dispatch<
    React.SetStateAction<RemunerationResponseData[]>
  >;
  role: RoleResponseData | null;
  setRole: React.Dispatch<React.SetStateAction<RoleResponseData | null>>;
  permissions: string[];
  setPermissions: React.Dispatch<React.SetStateAction<string[]>>;
  authenticatedUser: AuthState | null;
  setAuthenticatedUser: React.Dispatch<React.SetStateAction<AuthState | null>>;
  isLoading: boolean;
  componentLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
  dashboard: string;
  setDashboard: React.Dispatch<React.SetStateAction<string>>;
  activePage: string;
  setActivePage: React.Dispatch<React.SetStateAction<string>>;
  settings: SettingResponseData[];
  setSettings: React.Dispatch<React.SetStateAction<SettingResponseData[]>>;
  config: (key: string) => any;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const ContentContext = ({ children }: ProtectedProps) => {
  const { pathname } = useLocation();
  const { staff } = useAuth();
  const [apps, setApps] = useState<AuthPageResponseData[]>([]);
  const [navigation, setNavigation] = useState<AuthPageResponseData[]>([]);
  const [pages, setPages] = useState<AuthPageResponseData[]>([]);
  const [groups, setGroups] = useState<GroupResponseData[]>([]);
  const [remunerations, setRemunerations] = useState<
    RemunerationResponseData[]
  >([]);
  const [role, setRole] = useState<RoleResponseData | null>(null);
  const [dashboard, setDashboard] = useState<string>("");
  const [activePage, setActivePage] = useState<string>("");
  const [settings, setSettings] = useState<SettingResponseData[]>([]);

  const [permissions, setPermissions] = useState<string[]>([]);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthState | null>({
    staff: null,
    refresh_token: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [componentLoading, setComponentLoading] = useState<boolean>(false);

  // Convert string value to appropriate data type
  const convertValueToDataType = (
    value: string,
    dataType: SettingInputDataType
  ): any => {
    switch (dataType) {
      case "number":
        return value ? Number(value) : 0;
      case "boolean":
        return value === "true" || value === "1";
      case "object":
        try {
          return value ? JSON.parse(value) : {};
        } catch {
          return {};
        }
      case "array":
        try {
          return value ? JSON.parse(value) : [];
        } catch {
          return [];
        }
      default:
        return value || "";
    }
  };

  // Config function to get setting value by key
  const config = (key: string): any => {
    const setting = settings.find((s) => s.key === key);
    if (!setting) {
      console.warn(`Setting with key "${key}" not found`);
      return null;
    }
    return convertValueToDataType(setting.value, setting.input_data_type);
  };

  // Fetch settings on component mount
  useEffect(() => {
    if (staff) {
      const fetchSettings = async () => {
        try {
          const repository = new SettingRepository();
          const response = await repository.collection("settings");
          if (response.code === 200 && response.data) {
            setSettings(response.data as SettingResponseData[]);
          }
        } catch (error) {
          console.error("Failed to fetch settings:", error);
        }
      };

      fetchSettings();
    }
  }, [staff]);

  useEffect(() => {
    if (pathname !== "") {
      const pageName = pathname.split("/");
      const appPath = pageName[1];
      const pagePath = pageName.length > 2 ? `/${appPath}/${pageName[2]}` : "";
      setDashboard(`/${appPath}`);
      setActivePage(pagePath !== "" ? pagePath : `/${appPath}`);
    }
  }, [pathname]);

  return (
    <StateContext.Provider
      value={{
        apps,
        setApps,
        navigation,
        setNavigation,
        pages,
        setPages,
        groups,
        setGroups,
        remunerations,
        setRemunerations,
        role,
        setRole,
        permissions,
        setPermissions,
        authenticatedUser,
        setAuthenticatedUser,
        componentLoading,
        setComponentLoading,
        isLoading,
        setIsLoading,
        dashboard,
        setActivePage,
        activePage,
        setDashboard,
        settings,
        setSettings,
        config,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error(
      "useStateContext must be used within a ContentContext provider"
    );
  }
  return context;
};
