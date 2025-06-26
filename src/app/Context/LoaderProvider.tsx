import {
  ComponentType,
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { useStateContext } from "./ContentContext";

export interface LoaderProps {
  isOpen: boolean;
  status?: string;
  close?: () => void;
}

interface LoaderContextType {
  status: string;
  setStatus: Dispatch<SetStateAction<string>>;
  stopped: boolean;
  setStopped: Dispatch<SetStateAction<boolean>>;
  content: ReactNode | null;
  openLoader: (Component: ComponentType<LoaderProps>, text: string) => void;
  close: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { isLoading } = useStateContext();
  const [status, setStatus] = useState<string>("Loading");
  const [stopped, setStopped] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);

  const close = () => {
    console.log("I have been clicked!!");
  };

  const openLoader = (
    Component: React.ComponentType<LoaderProps>,
    text: string = "Loading"
  ) => {
    setStatus(text);
    setContent(<Component isOpen={isLoading} status={text} close={close} />);
  };
  return (
    <LoaderContext.Provider
      value={{
        status,
        stopped,
        setStatus,
        setStopped,
        close,
        openLoader,
        content,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = (): LoaderContextType => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};
