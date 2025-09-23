import { TransactionLinesProp } from "app/Hooks/useAccountingHooks";
import { BaseResponse, JsonResponse } from "app/Repositories/BaseRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { TransactionResponseData } from "app/Repositories/Transaction/data";
import Alert from "app/Support/Alert";
import { editableComponentRegistry } from "bootstrap/registry";
import { extractModelName, repo, toSnakeCase } from "bootstrap/repositories";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";

export type ProcessedDataProps<T extends BaseResponse> = {
  raw: T;
  status?: "cleared" | "altered" | "rejected";
  actionPerformed?: "add" | "subtract" | "exact" | "removed";
};

export type ServerSideProcessedDataProps<T extends BaseResponse> = {
  resources: ProcessedDataProps<T>[];
  state: {
    [key: string]: unknown;
  };
  document_id: number;
  document_draft_id: number;
  workflow_id: number;
  progress_tracker_id: number;
  document_action_id: number;
  service: string;
  mode: "store" | "update" | "destroy";
  method: string;
  user_id: number;
  department_id: number;
  budget_year: number;
  document_category: string;
  document_type: string;
  document_resource_id: number;
  trigger_workflow_id?: number;
  type: "staff" | "third-party";
  file: string;
  period: string;
  entity_type?: string;
  status?: string;
};

interface FileProcessorContextType {
  file: DocumentResponseData | null;
  setFile: (file: DocumentResponseData | null) => void;
  documentProcessed: DocumentResponseData | null;
  setDocumentProcessed: Dispatch<SetStateAction<DocumentResponseData | null>>;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  drafts: DocumentDraftResponseData[];
  editableComponent: JSX.Element | null;
  alterAction: DocumentActionResponseData | null;
  setAlterAction: Dispatch<SetStateAction<DocumentActionResponseData | null>>;
  processComplete: boolean;
  setProcessComplete: Dispatch<SetStateAction<boolean>>;
  processorUri: string;
  setProcessorUri: Dispatch<SetStateAction<string>>;
  service: string;
  setService: Dispatch<SetStateAction<string>>;
  paymentTransactions: Partial<TransactionResponseData>[];
  reconcile: DocumentActionResponseData | null;
  setReconcile: Dispatch<SetStateAction<DocumentActionResponseData | null>>;
  lastDraft: DocumentDraftResponseData | null;
  processedData: ProcessedDataProps<BaseResponse>[];
  processIncomingData: <T extends BaseResponse>(
    props: ProcessedDataProps<T>
  ) => void;
  processBatchIncomingData: <T extends BaseResponse>(
    list: ProcessedDataProps<T>[]
  ) => void;
  replaceProcessedData: <T extends BaseResponse>(
    processed: ProcessedDataProps<T>[]
  ) => void;
  convertToProcessingDataProps: <T extends BaseResponse>(
    collection: T[],
    status: "cleared" | "altered" | "rejected",
    actionPerformed: "add" | "subtract" | "exact" | "removed"
  ) => ProcessedDataProps<T>[];
  processIncomingStateAndResources: <T extends BaseResponse>(
    state: { [key: string]: unknown },
    resources: ProcessedDataProps<T>[],
    action: DocumentActionResponseData | null
  ) => void;
  resolveDataWithAction: <T extends BaseResponse>(
    action: DocumentActionResponseData,
    state?: Record<string, any>,
    processedData?: ProcessedDataProps<T>[]
  ) => void;
  updateServerProcessedData: <T extends BaseResponse>(
    props: Partial<ServerSideProcessedDataProps<T>>
  ) => void;
  processTransactionLines: (summary: TransactionLinesProp) => void;
  resetEditableState: () => void;
  resolveProcessedData: () => void;
  getState: (label: string) => void;
}

export type EditableComponentProps<T extends BaseResponse> = {
  file: DocumentResponseData;
  service: string;
  resource: T;
  action: DocumentActionResponseData | null;
};

const FileProcessorContext = createContext<
  FileProcessorContextType | undefined
>(undefined);

export const FileProcessorProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const documentRepo = useMemo(() => repo("document"), []);
  const [processorUri, setProcessorUri] = useState<string>(
    "process/request/data"
  );
  const [file, setFile] = useState<DocumentResponseData | null>(null);
  const [documentProcessed, setDocumentProcessed] =
    useState<DocumentResponseData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [alterAction, setAlterAction] =
    useState<DocumentActionResponseData | null>(null);

  const [drafts, setDrafts] = useState<DocumentDraftResponseData[]>([]);
  const [service, setService] = useState<string>("");
  const [reconcile, setReconcile] = useState<DocumentActionResponseData | null>(
    null
  );
  const [pendingResolution, setPendingResolution] = useState<boolean>(false);
  const [processComplete, setProcessComplete] = useState<boolean>(false);

  const [state, setState] = useState({
    processedData: [] as ProcessedDataProps<BaseResponse>[],
    serverSideProcessedData: {} as ServerSideProcessedDataProps<BaseResponse>,
    paymentTransactions: [] as Partial<TransactionResponseData>[],
  });

  const updateState = (patch: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const getState = (label: string) => {
    if (label in state) {
      return state[label as keyof typeof state];
    }

    // Invalid key used in getState
    return undefined;
  };

  const processIncomingStateAndResources = useCallback(
    <T extends BaseResponse>(
      stateInput: Record<string, unknown>,
      resources: ProcessedDataProps<T>[],
      action: DocumentActionResponseData | null = null
    ) => {
      if (!stateInput || resources.length < 1) return;
      updateState({
        serverSideProcessedData: {
          ...state.serverSideProcessedData,
          document_action_id: action
            ? action.id
            : state.serverSideProcessedData.document_action_id,
          state: stateInput,
          resources,
        },
      });
      resolveProcessedData();
    },
    []
  );

  const processTransactionLines = (
    summary: TransactionLinesProp,
    preparedTransactionLines?: TransactionResponseData[]
  ) => {
    const transactions = Object.values(summary).flatMap((entry) =>
      entry ? (Array.isArray(entry) ? entry : [entry]) : []
    );
    updateState({ paymentTransactions: transactions });
  };

  const convertToProcessingDataProps = <T extends BaseResponse>(
    collection: T[],
    status: "cleared" | "altered" | "rejected",
    actionPerformed: "add" | "subtract" | "exact" | "removed"
  ): ProcessedDataProps<T>[] => {
    return collection.map((data) => ({
      raw: data,
      status,
      actionPerformed,
    }));
  };

  const processIncomingData = <T extends BaseResponse>(
    props: ProcessedDataProps<T>
  ) => {
    if (!props) return;
    updateState({ processedData: [...state.processedData, props] });
  };

  const processBatchIncomingData = <T extends BaseResponse>(
    list: ProcessedDataProps<T>[]
  ) => {
    updateState({
      processedData: [...state.processedData, ...list],
    });
  };

  const replaceProcessedData = <T extends BaseResponse>(
    processed: ProcessedDataProps<T>[]
  ) => {
    updateState({ processedData: processed });
  };

  const resolveProcessedData = () => {
    Alert.flash("Confirm", "info", "Reconcile Data").then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await documentRepo.store(processorUri, {
            ...state.serverSideProcessedData,
            resources: state.processedData,
          });
          if (response) {
            setDocumentProcessed(response.data as DocumentResponseData);
            resetEditableState();
            toast.success(
              response?.message ?? "Document processed successfully!!"
            );
          }
        } catch (error) {
          toast.error("Something went wrong!!");
        }
      }
    });
  };

  const resolveDataWithAction = <T extends BaseResponse>(
    action: DocumentActionResponseData,
    stateInput?: Record<string, any>,
    processedData?: ProcessedDataProps<T>[]
  ) => {
    Alert.flash("Confirm", "info", "Consolidate Response Data").then(
      async (result) => {
        if (result.isConfirmed) {
          const body = {
            ...state.serverSideProcessedData,
            state: stateInput
              ? stateInput
              : state.serverSideProcessedData.state,
            resources:
              state.processedData.length < 1 && processedData
                ? processedData
                : state.processedData,
            document_action_id: action.id,
          };

          try {
            const response = await documentRepo.store(processorUri, body);

            if (response) {
              setDocumentProcessed(response.data as DocumentResponseData);
              resetEditableState();
              toast.success(
                response?.message ?? "Document processed successfully!!"
              );
            }
          } catch (error) {
            toast.error("Something went wrong!!");
          }
        }
      }
    );
  };

  const updateServerProcessedData = <T extends BaseResponse>(
    props: Partial<ServerSideProcessedDataProps<T>>
  ) => {
    updateState({
      serverSideProcessedData: { ...state.serverSideProcessedData, ...props },
    });
  };

  const resetEditableState = useCallback(() => {
    setFile(null);
    setDrafts([]);
    setService("");
    setAlterAction(null);
    setDocumentProcessed(null);
    setIsEditing(false);
    updateState({
      processedData: [],
      serverSideProcessedData: {} as ServerSideProcessedDataProps<BaseResponse>,
      paymentTransactions: [],
    });
  }, []);

  const editableComponent: JSX.Element | null = useMemo(() => {
    if (!file) return null;

    const componentKey = toSnakeCase(extractModelName(file.documentable_type));
    const EditableResourceComponent = editableComponentRegistry[componentKey];

    if (EditableResourceComponent && file.documentable) {
      setService(componentKey);

      return (
        <EditableResourceComponent
          file={file}
          service={componentKey}
          resource={file.documentable}
          action={alterAction}
        />
      );
    }

    return null;
  }, [file, alterAction]);

  const lastDraft = useMemo(() => {
    return drafts.length
      ? drafts.reduce((latest, current) =>
          current.id > latest.id ? current : latest
        )
      : null;
  }, [drafts]);

  useEffect(() => {
    if (file) {
      const { drafts = [], parents = [] } = file;
      setDrafts(drafts);
    }
  }, [file]);

  useEffect(() => {
    if (pendingResolution) {
      resolveProcessedData();
      setPendingResolution(false);
    }
  }, [pendingResolution]);

  return (
    <FileProcessorContext.Provider
      value={{
        file,
        documentProcessed,
        setDocumentProcessed,
        setFile,
        isEditing,
        setIsEditing,
        drafts,
        editableComponent,
        alterAction,
        setAlterAction,
        processorUri,
        setProcessorUri,
        processComplete,
        setProcessComplete,
        service,
        setService,
        lastDraft,
        processedData: state.processedData,
        convertToProcessingDataProps,
        processIncomingData,
        processBatchIncomingData,
        replaceProcessedData,
        processIncomingStateAndResources,
        updateServerProcessedData,
        resetEditableState,
        reconcile,
        setReconcile,
        resolveProcessedData,
        processTransactionLines,
        resolveDataWithAction,
        paymentTransactions: state.paymentTransactions,
        getState,
      }}
    >
      {children}
    </FileProcessorContext.Provider>
  );
};

export const useFileProcessor = (): FileProcessorContextType => {
  const context = useContext(FileProcessorContext);
  if (!context) {
    throw new Error(
      "useFileProcessor must be used within a FileProcessorProvider"
    );
  }
  return context;
};
