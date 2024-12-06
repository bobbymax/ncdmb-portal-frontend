/* eslint-disable react-hooks/exhaustive-deps */
import { AuthPageResponseData } from "app/Repositories/Page/data";
import { UserResponseData } from "app/Repositories/User/data";
import { createContext, useContext, useState } from "react";
import { ProtectedProps } from "resources/templates/Protected";

interface StateContextType {
  apps: AuthPageResponseData[];
  setApps: React.Dispatch<React.SetStateAction<AuthPageResponseData[]>>;
  navigation: AuthPageResponseData[];
  setNavigation: React.Dispatch<React.SetStateAction<AuthPageResponseData[]>>;
  pages: AuthPageResponseData[];
  setPages: React.Dispatch<React.SetStateAction<AuthPageResponseData[]>>;
  permissions: string[];
  setPermissions: React.Dispatch<React.SetStateAction<string[]>>;
  authenticatedUser: UserResponseData | null;
  setAuthenticatedUser: React.Dispatch<
    React.SetStateAction<UserResponseData | null>
  >;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const ContentContext = ({ children }: ProtectedProps) => {
  const [apps, setApps] = useState<AuthPageResponseData[]>([]);
  const [navigation, setNavigation] = useState<AuthPageResponseData[]>([]);
  const [pages, setPages] = useState<AuthPageResponseData[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [authenticatedUser, setAuthenticatedUser] =
    useState<UserResponseData | null>(null);
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
