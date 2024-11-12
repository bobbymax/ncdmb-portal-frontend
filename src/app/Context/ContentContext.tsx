/* eslint-disable react-hooks/exhaustive-deps */
import { AuthProvider } from "app/Providers/AuthProvider";
import MenuProvider from "app/Providers/MenuProvider";
import { ModuleResponseData } from "app/Repositories/ModuleRepository";
import { RoleResponseData } from "app/Repositories/RoleRepository";
import { UserResponseData } from "app/Repositories/UserRepository";
import { createContext, useContext, useEffect, useState } from "react";
import { ProtectedProps } from "resources/templates/Protected";

interface StateContextType {
  navigation: ModuleResponseData[];
  setNavigation: React.Dispatch<React.SetStateAction<ModuleResponseData[]>>;
  roles: RoleResponseData[];
  setRoles: React.Dispatch<React.SetStateAction<RoleResponseData[]>>;
  permissions: string[];
  setPermissions: React.Dispatch<React.SetStateAction<string[]>>;
  authenticatedUser: UserResponseData | null;
  setAuthenticatedUser: React.Dispatch<
    React.SetStateAction<UserResponseData | null>
  >;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const ContentContext = ({ children }: ProtectedProps) => {
  const authProvider = new AuthProvider();
  const [roles, setRoles] = useState<RoleResponseData[]>([]);
  const [navigation, setNavigation] = useState<ModuleResponseData[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [authenticatedUser, setAuthenticatedUser] =
    useState<UserResponseData | null>(null);

  useEffect(() => {
    if (authProvider.isAuthenticated()) {
      setAuthenticatedUser(authProvider.getAuthenticatedUser());
    }
  }, []);

  useEffect(() => {
    if (authenticatedUser) {
      const getNavigation = async () => {
        const response = await MenuProvider.navigation();

        if (response.status === 200) {
          setNavigation(response.data?.data);
        }
      };

      getNavigation();
    }
  }, [authenticatedUser]);

  return (
    <StateContext.Provider
      value={{
        navigation,
        setNavigation,
        roles,
        setRoles,
        permissions,
        setPermissions,
        authenticatedUser,
        setAuthenticatedUser,
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
