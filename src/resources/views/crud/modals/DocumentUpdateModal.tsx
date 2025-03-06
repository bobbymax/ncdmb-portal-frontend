import { ModalValueProps, useModal } from "app/Context/ModalContext";
import useDocketPipelines from "app/Hooks/useDocketPipelines";
import { BaseResponse, JsonResponse } from "app/Repositories/BaseRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { DocumentUpdateResponseData } from "app/Repositories/DocumentUpdate/data";
import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";

export interface ActionComponentProps<T = JsonResponse> {
  identifier: string;
  updateDocumentState: (
    identifier: string,
    newState: Partial<DocumentUpdateResponseData>
  ) => void;
  data: DocumentResponseData;
  currentDraft: DocumentDraftResponseData;
  action: DocumentActionResponseData;
  dependencies: any[][];
  isUpdating: boolean;
  onSubmit: (response: unknown, service: string) => void;
  updateServerState: (data: Record<string, unknown>) => void;
  state: T;
}

type DependenciesProps = [
  requirements: [
    action: DocumentActionResponseData | null,
    currentDraft: DocumentDraftResponseData | null
  ],
  actions: DocumentActionResponseData[]
];

const DocumentUpdateModal: React.FC<ModalValueProps> = ({
  data,
  isUpdating,
  dependencies,
  onSubmit,
  template,
}) => {
  const { getModalState, updateModalState } = useModal();
  const identifier = "resource-update";
  const state: JsonResponse = getModalState(identifier);
  // console.log(dependencies);

  const ActionTemplate = useMemo(() => {
    const sanitizedComponent =
      template?.replace(/[^a-zA-Z0-9]/g, "") || "FallbackComponent";
    return lazy(() =>
      import(`../templates/${sanitizedComponent}`).catch((error) => {
        console.error(`Error loading component: ${sanitizedComponent}`, error);
        return { default: () => <div>Error loading component</div> };
      })
    );
  }, [template]);

  const [action, setAction] = useState<DocumentActionResponseData | null>(null);
  const [actions, setActions] = useState<DocumentActionResponseData[]>([]);
  const [currentDraft, setCurrentDraft] =
    useState<DocumentDraftResponseData | null>(null);

  const { updateServerState } = useDocketPipelines(
    state,
    actions,
    currentDraft as DocumentDraftResponseData
  );

  useEffect(() => {
    if (Array.isArray(dependencies) && dependencies.length > 0) {
      const [requirements = [], actions = []] =
        dependencies as DependenciesProps;

      setAction(requirements[0] as DocumentActionResponseData);
      setCurrentDraft(requirements[1] as DocumentDraftResponseData);
      setActions(actions);
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
        onSubmit={onSubmit}
        updateDocumentState={updateModalState}
        state={state}
        currentDraft={currentDraft}
        updateServerState={updateServerState}
      />
    </Suspense>
  );
};

export default DocumentUpdateModal;
