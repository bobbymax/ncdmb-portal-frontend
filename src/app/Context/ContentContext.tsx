/* eslint-disable react-hooks/exhaustive-deps */
import { AuthPageResponseData } from "app/Repositories/Page/data";
import { createContext, useContext, useState } from "react";
import { ProtectedProps } from "resources/templates/Protected";
import { AuthState, AuthUserResponseData } from "./AuthContext";
import { GroupResponseData } from "app/Repositories/Group/data";
import { RoleResponseData } from "app/Repositories/Role/data";
import { RemunerationResponseData } from "app/Repositories/Remuneration/data";

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
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const ContentContext = ({ children }: ProtectedProps) => {
  const [apps, setApps] = useState<AuthPageResponseData[]>([]);
  const [navigation, setNavigation] = useState<AuthPageResponseData[]>([]);
  const [pages, setPages] = useState<AuthPageResponseData[]>([]);
  const [groups, setGroups] = useState<GroupResponseData[]>([]);
  const [remunerations, setRemunerations] = useState<
    RemunerationResponseData[]
  >([]);
  const [role, setRole] = useState<RoleResponseData | null>(null);

  const [permissions, setPermissions] = useState<string[]>([]);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthState | null>({
    staff: null,
    refresh_token: null,
    token: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
        isLoading,
        setIsLoading,
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
