import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ServerDataRequestProps,
  ServerStateRequestProps,
} from "./useWorkflowEngine";
import { BaseResponse } from "app/Repositories/BaseRepository";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { DocumentUpdateResponseData } from "app/Repositories/DocumentUpdate/data";
import Alert from "app/Support/Alert";
import { useModal } from "app/Context/ModalContext";
import { useNavigate } from "react-router-dom";
import DocumentUpdateRepository from "app/Repositories/DocumentUpdate/DocumentUpdateRepository";
import DocumentUpdateModal from "resources/views/crud/modals/DocumentUpdateModal";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { service } from "bootstrap/repositories";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";

const useDocketPipelines = <T extends BaseResponse>(
  resource: T,
  actions: DocumentActionResponseData[],
  currentDraft: DocumentDraftResponseData
) => {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const Repo = useMemo(() => new DocumentUpdateRepository(), []);

  const [serverState, setServerState] = useState<ServerStateRequestProps>({
    resource_id: 0,
    user_id: 0,
    mode: "update",
    data: {},
  });

  const updateServerState = (
    data: Record<string, unknown>,
    mode: "store" | "update" | "destroy"
  ) => {
    setServerState((prev) => ({ ...prev, data, mode }));
  };

  // 🔹 Handles Modal Actions
  const resolve = useCallback(
    async (
      action: DocumentActionResponseData,
      fileState: ServerDataRequestProps,
      nextTracker?: ProgressTrackerResponseData,
      bodyService?: string,
      message?: string
    ) => {
      const derivedService =
        bodyService ?? service(currentDraft.document_draftable_type);

      if (action.has_update === 1) {
        openModal(
          DocumentUpdateModal,
          derivedService,
          {
            title: action.name,
            isUpdating: false,
            onSubmit: (updatedData) => handleDraftUpdate(updatedData, action),
            dependencies: [
              [action, currentDraft, nextTracker, message],
              actions,
            ],
            template: action.component,
            data: resource,
          },
          fileState
        );
      } else {
        const confirm = await Alert.flash(
          action.name,
          "info",
          "Once submitted this document will be updated!"
        );

        if (confirm.isConfirmed) {
          const response = await processDocumentUpdate(
            fileState,
            action.id,
            derivedService,
            message
          );
          if (response?.code === 200) navigate("/desk/folders");
        }
      }
    },
    [resource, currentDraft, actions, openModal, navigate]
  );

  // 🔹 Updates Document Draft After Modal Submission
  const handleDraftUpdate = useCallback(
    async (updatedData: unknown, action: DocumentActionResponseData) => {
      closeModal();

      if (!updatedData) return;

      try {
        const updateResponse = await updateDocumentDraft(
          currentDraft.id,
          updatedData as DocumentUpdateResponseData
        );
        console.log("Draft Updated: ", updateResponse);
      } catch (error) {
        console.error("Error updating draft: ", error);
      }
    },
    [closeModal, currentDraft]
  );

  const updateDocumentDraft = async (
    draftId: number,
    updateState: DocumentUpdateResponseData
  ) => {
    try {
      return await Repo.update("documentUpdates", draftId, updateState);
    } catch (error) {
      console.error("Error Updating Document Draft: ", error);
      return null;
    }
  };

  const processDocumentUpdate = async (
    fileState: Partial<ServerDataRequestProps>,
    actionId: number,
    service: string,
    message?: string
  ) => {
    const body: Partial<ServerDataRequestProps> = {
      ...fileState,
      document_action_id: actionId,
      serverState,
      message: message ?? "",
    };

    try {
      return await Repo.update("service-workers", service, body);
    } catch (error) {
      console.error("Error Updating Workflow: ", error);
      return null;
    }
  };

  useEffect(() => {
    if (resource) {
      setServerState((prev) => ({
        ...prev,
        resource_id: resource.id,
        resource,
      }));
    }
  }, [resource]);

  return {
    serverState,
    updateDocumentDraft,
    processDocumentUpdate,
    resolve,
    updateServerState,
  };
};

export default useDocketPipelines;
