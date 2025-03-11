import { BaseResponse, JsonResponse } from "app/Repositories/BaseRepository";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { ServerDataRequestProps } from "./useWorkflowEngine";
import { ServerResponse } from "app/Services/RepositoryService";
import { repo, service } from "bootstrap/repositories";
import useFunnels from "./useFunnels";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { useModal } from "app/Context/ModalContext";
import { useAuth } from "app/Context/AuthContext";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { toast } from "react-toastify";
import { useCallback, useState } from "react";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import Alert from "app/Support/Alert";
import DocumentUpdateModal from "resources/views/crud/modals/DocumentUpdateModal";

export const useFileDeskRoutePipelines = <T extends BaseResponse>(
  resource: T,
  currentDraft: DocumentDraftResponseData,
  needsSignature: boolean,
  currentStage: WorkflowStageResponseData | undefined,
  fileState: ServerDataRequestProps,
  currentTracker: ProgressTrackerResponseData | undefined,
  nextTracker: ProgressTrackerResponseData | undefined,
  updateRaw: ((data: JsonResponse) => void) | undefined = undefined
) => {
  const { openModal, closeModal } = useModal();
  const { staff } = useAuth();
  const funnel = useFunnels();
  const [error, setError] = useState<string>("");

  /**
   * Builds the `mutatedState` for API requests
   */
  const buildMutatedState = (
    service: string,
    updatedValue: string | object,
    mode: "store" | "update" | "destroy" | "generate",
    action?: DocumentActionResponseData | null
  ): ServerDataRequestProps => {
    const authorisingOfficer =
      currentStage?.append_signature && fileState.signature ? staff?.id : 0;

    return {
      ...fileState,
      document_action_id: action?.id ?? 0,
      authorising_staff_id: authorisingOfficer ?? 0,
      service,
      serverState: {
        ...fileState.serverState,
        data: updatedValue as { [key: string]: unknown },
        mode:
          service === "document_update" || (action && action?.is_resource === 1)
            ? "store"
            : mode,
      },
    };
  };

  /**
   * Handles form submissions
   */
  const handleOnSubmit = async (
    updatedValue: string | object,
    mode: "store" | "update" | "destroy" | "generate",
    column?: string,
    action?: DocumentActionResponseData | null,
    identifier?: string
  ) => {
    const serviceName = identifier ?? "document";
    const mutatedState = buildMutatedState(
      serviceName,
      updatedValue,
      mode,
      action
    );

    console.log(mutatedState);

    const response: ServerResponse | undefined = await funnel.stream(
      repo(serviceName),
      mutatedState
    );

    if (response?.data && updateRaw) {
      updateRaw(response.data as DocumentResponseData);
      toast.success(response.message);
    } else {
      handleError("Cannot process workflow");
    }

    closeModal();
  };

  /**
   * Handles error messages
   */
  const handleError = (message: string) => {
    setError(message);
    toast.error(message);
  };

  /**
   * Resolves the action to execute
   */
  const resolveAction = useCallback(
    async (action: DocumentActionResponseData) => {
      if (needsSignature && !fileState.signature) return false;

      let serverSideService = service(currentDraft?.document_draftable_type);
      const actionMode = action.is_resource === 1 ? "store" : "update";

      if (
        action.action_status === "passed" &&
        action.is_resource === 1 &&
        nextTracker?.document_type?.service
      ) {
        serverSideService = service(nextTracker.document_type.service);
      } else if (action.has_update === 1) {
        serverSideService = "document_update";
      }

      const mutateState: ServerDataRequestProps = {
        ...fileState,
        service: serverSideService,
        document_action_id: action.id,
        serverState: {
          ...fileState.serverState,
          resource_id: resource.id,
          mode: serverSideService === "document_update" ? "store" : actionMode,
        },
      };

      console.log(serverSideService, mutateState);

      if (action.is_resource === 1 || action.has_update === 1) {
        openModal(DocumentUpdateModal, serverSideService, {
          title: action.name,
          isUpdating: true,
          onSubmit: handleOnSubmit,
          dependencies: [[action, currentDraft, nextTracker]],
          template: action.component,
          data: mutateState,
          service: serverSideService,
        });
      } else {
        Alert.flash(
          "Confirm Action",
          "info",
          "You're about to confirm this action!"
        ).then(async (result) => {
          if (result.isConfirmed) {
            const response: ServerResponse | undefined = await funnel.stream(
              repo(serverSideService),
              mutateState
            );

            if (response?.data && updateRaw) {
              updateRaw(response.data as DocumentResponseData);
              toast.success(response.message);
            } else {
              handleError("Cannot process workflow");
            }
          }
        });
      }
    },
    [needsSignature, fileState, nextTracker, currentDraft, currentTracker]
  );

  return { handleOnSubmit, resolveAction, error };
};
