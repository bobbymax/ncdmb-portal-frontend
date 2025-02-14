import { BaseResponse, JsonResponse } from "app/Repositories/BaseRepository";
import { Raw } from "app/Support/DataTable";
import React, { createContext, useContext, useState, ReactNode } from "react";

type ModalState = {
  [key: string]: any; // Keyed by modal content identifiers
};

export interface ModalValueProps<T = JsonResponse> {
  title: string;
  data?: T;
  isUpdating: boolean;
  count?: number;
  currentId?: number;
  onSubmit: (
    raw: object | string,
    mode: "store" | "update" | "destroy" | "generate",
    column?: string
  ) => void;
  dependencies?: any[][];
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
    Component: React.ComponentType<ModalValueProps>,
    identifier: string,
    props: ModalValueProps,
    initialData?: BaseResponse
  ) => void;
  title: string;
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
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<ReactNode | null>(null);
  const [modalState, setModalState] = useState<ModalState>({});

  const openModal = (
    Component: React.ComponentType<ModalValueProps>,
    identifier: string,
    props: ModalValueProps,
    initialData?: BaseResponse
  ) => {
    // console.log(content);

    setContent(<Component {...props} />);
    setTitle(props.title);
    setIsOpen(true);
    setModalState((prevState) => ({
      ...prevState,
      [identifier]: initialData || {}, // Initialize modalState with ResponseData if provided
    }));
  };

  const closeModal = () => {
    setIsOpen(false);
    setContent(null);
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
        openModal,
        closeModal,
        updateModalState,
        getModalState,
        onManageRaw,
        onSubmit,
        isOpen,
        content,
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
