import { useStateContext } from "app/Context/ContentContext";
import { ModalValueProps, useModal } from "app/Context/ModalContext";
import { ServerDataRequestProps } from "app/Hooks/useWorkflowEngine";
import { BaseRepository, JsonResponse } from "app/Repositories/BaseRepository";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { DocumentUpdateResponseData } from "app/Repositories/DocumentUpdate/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { repo } from "bootstrap/repositories";
import React, {
  FormEvent,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface ActionComponentProps<T = JsonResponse, D = BaseRepository> {
  identifier: string;
  getModalState: (identifier: string) => T;
  updateModalState: (
    identifier: string,
    newState: Partial<DocumentUpdateResponseData>
  ) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleFormSubmit: (e: FormEvent<HTMLFormElement>) => void;
  data: ServerDataRequestProps;
  currentDraft: DocumentDraftResponseData;
  action: DocumentActionResponseData;
  dependencies: any[][];
  isUpdating: boolean;
  updateServerState: (data: Record<string, string | object>) => void;
  service: string;
  Repo: D;
  isLoading: boolean;
}

type DependenciesProps = [
  requirements: [
    action: DocumentActionResponseData | null,
    currentDraft: DocumentDraftResponseData | null,
    nextTracker: ProgressTrackerResponseData | null
  ]
];

const DocumentUpdateModal: React.FC<ModalValueProps> = ({
  data,
  isUpdating,
  dependencies,
  onSubmit,
  template,
  service,
}) => {
  const { getModalState, updateModalState } = useModal();
  const identifier = service ?? "document";
  const { isLoading } = useStateContext();

  const [action, setAction] = useState<DocumentActionResponseData | null>(null);
  const [currentDraft, setCurrentDraft] =
    useState<DocumentDraftResponseData | null>(null);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();

    const currentState = getModalState(identifier);
    onSubmit(
      currentState,
      isUpdating ? "update" : "store",
      "",
      action,
      identifier
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    updateModalState(identifier, { [name]: value });
  };

  const ActionTemplate = useMemo(() => {
    const sanitizedComponent =
      template?.replace(/[^a-zA-Z0-9]/g, "") || "FallbackComponent";
    return lazy(() =>
      import(`../templates/actions/${sanitizedComponent}`).catch((error) => {
        console.error(`Error loading component: ${sanitizedComponent}`, error);
        return { default: () => <div>Error loading component</div> };
      })
    );
  }, [template]);

  useEffect(() => {
    if (Array.isArray(dependencies) && dependencies.length > 0) {
      const [requirements = []] = dependencies as DependenciesProps;
      setAction(requirements[0] as DocumentActionResponseData);
      setCurrentDraft(requirements[1] as DocumentDraftResponseData);
    }
  }, [dependencies]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActionTemplate
        identifier={identifier}
        data={data}
        action={action}
        dependencies={dependencies}
        isUpdating={isUpdating}
        getModalState={getModalState}
        updateModalState={updateModalState}
        handleInputChange={handleInputChange}
        handleFormSubmit={handleFormSubmit}
        currentDraft={currentDraft}
        service={service}
        Repo={repo(service ?? "document")}
        isLoading={isLoading}
      />
    </Suspense>
  );
};

export default DocumentUpdateModal;
