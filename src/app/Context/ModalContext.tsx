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
  useCallback,
} from "react";
import { ProcessedDataProps } from "./FileProcessorProvider";
import { BlockDataType } from "app/Repositories/Block/data";
import { toast } from "react-toastify";
import DocumentCategoryRepository from "../Repositories/DocumentCategory/DocumentCategoryRepository";
import {
  CategoryProgressTrackerProps,
  CategoryWorkflowProps,
} from "../Repositories/DocumentCategory/data";
import {
  ProcessFlowConfigProps,
  ProcessFlowType,
  WorkflowDependencyProps,
} from "resources/views/crud/DocumentWorkflow";
import {
  DeskComponentPropTypes,
  SheetProps,
} from "resources/views/pages/DocumentTemplateContent";

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

export interface WorkflowModalProps<K extends ProcessFlowType> {
  type: K;
  title: string;
  modalState: ProcessFlowConfigProps[K];
  data: ProcessFlowConfigProps[K] | null;
  isUpdating: boolean;
  handleSubmit: (
    type: K,
    config: ProcessFlowConfigProps[K],
    mode: "store" | "update"
  ) => void;
  dependencies: WorkflowDependencyProps;
  extras?: unknown;
}

export interface DeskComponentModalProps<P extends DeskComponentPropTypes> {
  title: string;
  type: P;
  blockState: SheetProps[P];
  data?: unknown;
  isUpdating: boolean;
  resolve: (props: unknown, mode?: "store" | "update") => void;
  dependencies?: unknown;
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
  openDeskComponent: <P extends DeskComponentPropTypes>(
    Component: React.ComponentType<DeskComponentModalProps<P>>,
    props: DeskComponentModalProps<P>,
    type: P,
    initialState?: unknown
  ) => void;
  openWorkflow: <K extends ProcessFlowType>(
    Component: React.ComponentType<WorkflowModalProps<K>>,
    identifier: K,
    props: WorkflowModalProps<K>,
    initialData?: ProcessFlowConfigProps[K]
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
    setContent(<Component {...props} />);
    setCurrentIdentifier(identifier);
    setTitle(props.title);
    setIsOpen(true);
    setModalState((prevState) => ({
      ...prevState,
      [identifier]: initialData || {}, // Initialize modalState with ResponseData if provided
    }));
  };

  const openWorkflow = <K extends ProcessFlowType>(
    Component: React.ComponentType<WorkflowModalProps<K>>,
    identifier: K,
    props: WorkflowModalProps<K>,
    initialData?: ProcessFlowConfigProps[K]
  ) => {
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

  const openDeskComponent = <P extends DeskComponentPropTypes>(
    DeskComponent: React.ComponentType<DeskComponentModalProps<P>>,
    props: DeskComponentModalProps<P>,
    type: P,
    initialState?: unknown
  ) => {
    setContent(<DeskComponent {...props} />);
    setCurrentIdentifier(type);
    setIsOpen(true);
    setTitle(props.title);
    setModalState((prevState) => ({
      ...prevState,
      [type]: initialState || {}, // Initialize modalState with ResponseData if provided
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
    setModalState({});
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
    if (response.success) {
      toast.success(response.message);
      closeModal();
    } else {
      toast.error(response.message);
    }
  };

  const updateModalState = useCallback(
    (identifier: string, newState: Partial<BaseResponse>) => {
      setModalState((prevState) => ({
        ...prevState,
        [identifier]: { ...prevState[identifier], ...newState },
      }));
    },
    []
  );

  const getModalState = useCallback(
    (identifier: string) => modalState[identifier] || {},
    [modalState]
  );

  return (
    <ModalContext.Provider
      value={{
        title,
        currentIdentifier,
        openModal,
        openWorkflow,
        openLoop,
        openDeskComponent,
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
