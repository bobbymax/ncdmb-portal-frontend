import {
  BaseRepository,
  BaseResponse,
  JsonResponse,
} from "app/Repositories/BaseRepository";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { Raw } from "app/Support/DataTable";
import { generateUniqueString } from "app/Support/Helpers";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  ComponentType,
  FormEvent,
} from "react";
import { ProcessedDataProps } from "./FileProcessorProvider";

type ModalState = {
  [key: string]: any; // Keyed by modal content identifiers
};

export interface ModalLoopProps<
  D extends BaseRepository,
  T extends BaseResponse
> {
  title: string;
  modalState: T;
  data: T | null;
  repo: D;
  isUpdating: boolean;
  handleSubmit: (props: ProcessedDataProps<T>) => void;
  dependencies?: object;
  extras?: any;
}

export interface ModalValueProps<T = JsonResponse> {
  title: string;
  data?: T;
  isUpdating: boolean;
  count?: number;
  currentId?: number;
  onSubmit: (
    raw: object | string,
    mode: "store" | "update" | "destroy" | "generate",
    column?: string,
    action?: DocumentActionResponseData | null,
    serverService?: string
  ) => void;
  dependencies?: any[][];
  template?: string;
  service?: string;
}

interface ManageModalProps {
  data: Raw;
  Component: React.ComponentType<ModalValueProps>;
  identifier: string;
  props: ModalValueProps;
  initialData?: BaseResponse;
}

interface ModalContextType {
  openModal: (
    Component: ComponentType<ModalValueProps>,
    identifier: string,
    props: ModalValueProps,
    initialData?: BaseResponse
  ) => void;
  openLoop: (
    Component: React.ComponentType<ModalLoopProps<any, any>>,
    identifier: string,
    props: ModalLoopProps<any, any>,
    initialData?: BaseResponse
  ) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleLoopFormSubmit: (
    e: FormEvent,
    onResponse: (response: object, mode: "store" | "update" | "destroy") => void
  ) => void;
  title: string;
  currentIdentifier: string;
  closeModal: () => void;
  updateModalState: (identifier: string, newState: any) => void;
  getModalState: (identifier: string) => any;
  onManageRaw: (params: ManageModalProps) => void;
  onSubmit: (
    response: JsonResponse,
    mode: "store" | "update" | "destroy"
  ) => void;
  isOpen: boolean;
  content: ReactNode | null;
  size: "sm" | "md" | "lg";
  setSize: Dispatch<SetStateAction<"sm" | "md" | "lg">>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIdentifier, setCurrentIdentifier] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<ReactNode | null>(null);
  const [modalState, setModalState] = useState<ModalState>({});
  const [size, setSize] = useState<"sm" | "md" | "lg">("lg");
  const [mode, setMode] = useState<"store" | "update" | "destroy">("store");

  const openModal = (
    Component: React.ComponentType<ModalValueProps>,
    identifier: string,
    props: ModalValueProps,
    initialData?: BaseResponse,
    Repo?: BaseRepository
  ) => {
    // console.log(content);

    setContent(<Component {...props} />);
    setCurrentIdentifier(identifier);
    setTitle(props.title);
    setIsOpen(true);
    setModalState((prevState) => ({
      ...prevState,
      [identifier]: initialData || {}, // Initialize modalState with ResponseData if provided
    }));
  };

  const openLoop = <D extends BaseRepository, T extends BaseResponse>(
    Component: React.ComponentType<ModalLoopProps<D, T>>,
    identifier: string,
    props: ModalLoopProps<D, T>,
    initialData?: T
  ) => {
    setCurrentIdentifier(identifier);
    setContent(<Component {...props} />);
    setTitle(props.title);
    setIsOpen(true);
    setModalState((prevState) => ({
      ...prevState,
      [identifier]: initialData || {}, // Initialize modalState with ResponseData if provided
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    updateModalState(currentIdentifier, { [name]: value });
  };

  const handleLoopFormSubmit = (
    e: FormEvent,
    onResponse: (response: any, mode: "store" | "update" | "destroy") => void
  ) => {
    e.preventDefault();

    const response =
      mode === "store"
        ? modalState
        : {
            ...modalState,
            identifier: generateUniqueString(32),
          };

    const extracted = (response as any)[currentIdentifier];
    onResponse(extracted, mode);
  };

  const closeModal = () => {
    setIsOpen(false);
    setContent(null);
    setCurrentIdentifier("");
    setTitle("");
  };

  const onManageRaw = (params: ManageModalProps) => {
    openModal(
      params.Component,
      params.identifier,
      params.props,
      params.initialData
    );
  };

  const onSubmit = (
    response: JsonResponse,
    mode: "store" | "update" | "destroy"
  ) => {
    // console.log(response);
  };

  const updateModalState = (
    identifier: string,
    newState: Partial<BaseResponse>
  ) => {
    setModalState((prevState) => ({
      ...prevState,
      [identifier]: { ...prevState[identifier], ...newState },
    }));
  };

  const getModalState = (identifier: string) => modalState[identifier] || {};

  return (
    <ModalContext.Provider
      value={{
        title,
        currentIdentifier,
        openModal,
        openLoop,
        closeModal,
        handleInputChange,
        updateModalState,
        handleLoopFormSubmit,
        getModalState,
        onManageRaw,
        onSubmit,
        isOpen,
        content,
        size,
        setSize,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
