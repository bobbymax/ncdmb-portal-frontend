import { BaseResponse, JsonResponse } from "app/Repositories/BaseRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import Alert from "app/Support/Alert";
import { editableComponentRegistry } from "bootstrap/registry";
import { extractModelName, repo, toSnakeCase } from "bootstrap/repositories";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
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
  // entity_type?: string;
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
  processorUri: string;
  setProcessorUri: Dispatch<SetStateAction<string>>;
  service: string;
  setService: Dispatch<SetStateAction<string>>;
  reconcile: DocumentActionResponseData | null;
  setReconcile: Dispatch<SetStateAction<DocumentActionResponseData | null>>;
  lastDraft: DocumentDraftResponseData | null;
  processedData: ProcessedDataProps<BaseResponse>[];
  processIncomingData: <T extends BaseResponse>(
    props: ProcessedDataProps<T>
  ) => void;
  processIncomingStateAndResources: <T extends BaseResponse>(
    state: { [key: string]: unknown },
    resources: ProcessedDataProps<T>[],
    action: DocumentActionResponseData | null
  ) => void;
  updateServerProcessedData: <T extends BaseResponse>(
    props: Partial<ServerSideProcessedDataProps<T>>
  ) => void;
  resetEditableState: () => void;
  resolveProcessedData: () => void;
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

  const [chains, setChains] = useState<DocumentResponseData[]>([]);
  const [drafts, setDrafts] = useState<DocumentDraftResponseData[]>([]);
  const [service, setService] = useState<string>("");
  const [processedData, setProcessedData] = useState<
    ProcessedDataProps<BaseResponse>[]
  >([]);
  const [serverSideProcessedData, setServerSideProcessedData] = useState<
    ServerSideProcessedDataProps<BaseResponse>
  >({} as ServerSideProcessedDataProps<BaseResponse>);
  const [reconcile, setReconcile] = useState<DocumentActionResponseData | null>(
    null
  );
  const [pendingResolution, setPendingResolution] = useState<boolean>(false);

  // console.log(serverSideProcessedData);

  const processIncomingStateAndResources = <T extends BaseResponse>(
    state: { [key: string]: unknown },
    resources: ProcessedDataProps<T>[],
    action: DocumentActionResponseData | null = null
  ) => {
    if (!state || resources.length < 1) return;
    setServerSideProcessedData((prev) => ({
      ...prev,
      document_action_id: action ? action.id : prev.document_action_id,
      state,
      resources,
    }));

    //  Reconcile Data Here
    setPendingResolution(true);
  };

  const processIncomingData = <T extends BaseResponse>(
    props: ProcessedDataProps<T>
  ) => {
    if (!props) return;
    setProcessedData((prev) => [...prev, props]);
  };

  const resolveProcessedData = () => {
    Alert.flash("Confirm", "info", "Reconcile Data").then(async (result) => {
      if (result.isConfirmed) {
        // Do Something

        try {
          const response = await documentRepo.store(
            processorUri,
            serverSideProcessedData
          );

          if (response) {
            setDocumentProcessed(response.data as DocumentResponseData);
            resetEditableState();
            toast.success(
              response?.message ?? "Document processed successfully!!"
            );
          }
        } catch (error) {
          console.log("Something went wrong: ", error);
          toast.error("Something went wrong!!");
        }
      }
    });
  };

  // console.log(serverSideProcessedData);

  const updateServerProcessedData = <T extends BaseResponse>(
    props: Partial<ServerSideProcessedDataProps<T>>
  ) => {
    setServerSideProcessedData((prev) => ({
      ...prev,
      ...props,
    }));
  };

  const resetEditableState = () => {
    setFile(null);
    setServerSideProcessedData(
      {} as ServerSideProcessedDataProps<BaseResponse>
    );
    setDrafts([]);
    setService("");
    setAlterAction(null);
    setProcessedData([]);
    setChains([]);
    setIsEditing(false);
    setDocumentProcessed(null);
  };

  const editableComponent: JSX.Element | null = useMemo(() => {
    if (!file) return null;

    setIsEditing(true);
    const componentKey = toSnakeCase(extractModelName(file.documentable_type));
    const EditableResourceComponent = editableComponentRegistry[componentKey];

    const isEditableAndHasResource =
      EditableResourceComponent && file?.documentable;

    if (isEditableAndHasResource) setService(componentKey);

    return isEditableAndHasResource ? (
      <EditableResourceComponent
        file={file}
        service={componentKey}
        resource={file.documentable}
        action={alterAction}
      />
    ) : null;
  }, [file]);

  const lastDraft: DocumentDraftResponseData | null = useMemo(() => {
    if (drafts.length < 1) return null;

    return drafts.reduce((latest, current) =>
      current.id > latest.id ? current : latest
    );
  }, [drafts]);

  useEffect(() => {
    if (file) {
      const { drafts = [], parents = [] } = file;

      setDrafts(drafts);
      setChains(parents);
    }
  }, [file]);

  useEffect(() => {
    if (processedData.length > 0) {
      setServerSideProcessedData((prev) => ({
        ...prev,
        resources: processedData,
      }));
    }
  }, [processedData]);

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
        service,
        setService,
        lastDraft,
        processedData,
        processIncomingData,
        processIncomingStateAndResources,
        updateServerProcessedData,
        resetEditableState,
        reconcile,
        setReconcile,
        resolveProcessedData,
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
