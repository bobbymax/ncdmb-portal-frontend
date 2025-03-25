import { BaseResponse, JsonResponse } from "app/Repositories/BaseRepository";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { ServerDataRequestProps } from "./useWorkflowEngine";
import { ServerResponse } from "app/Services/RepositoryService";
import {
  extractModelName,
  formatCamelCaseToSpaced,
  repo,
  service,
} from "bootstrap/repositories";
import useFunnels from "./useFunnels";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { useModal } from "app/Context/ModalContext";
import { useAuth } from "app/Context/AuthContext";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { toast } from "react-toastify";
import { useCallback, useMemo, useState } from "react";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import Alert from "app/Support/Alert";
import DocumentUpdateModal from "resources/views/crud/modals/DocumentUpdateModal";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "app/Context/ContentContext";
import { SignatoryResponseData } from "app/Repositories/Signatory/data";
import { SignatureResponseData } from "app/Repositories/Signature/data";

export const useFileDeskRoutePipelines = <T extends BaseResponse>(
  resource: T,
  currentDraft: DocumentDraftResponseData,
  needsSignature: boolean,
  currentStage: WorkflowStageResponseData | undefined,
  fileState: ServerDataRequestProps,
  currentTracker: ProgressTrackerResponseData | undefined,
  nextTracker: ProgressTrackerResponseData | undefined,
  updateRaw: ((data: JsonResponse) => void) | undefined = undefined,
  signatories?: SignatoryResponseData[],
  drafts?: DocumentDraftResponseData[]
) => {
  const { setIsLoading } = useStateContext();
  const { openModal, closeModal } = useModal();
  const { staff } = useAuth();
  const funnel = useFunnels();
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const activeSignatory: SignatoryResponseData | null = useMemo(() => {
    if (
      !signatories ||
      signatories.length < 1 ||
      !currentTracker ||
      currentTracker.signatory_id < 1
    )
      return null;

    return (
      signatories.find(
        (signatory) => signatory.id === currentTracker.signatory_id
      ) ?? null
    );
  }, [signatories, currentTracker]);

  const signatures: SignatureResponseData[] = useMemo(() => {
    if (!signatories || signatories.length < 1 || !drafts) return [];

    return drafts.flatMap((draft) => {
      const history = draft.history ?? [];
      const approval = draft.approval;

      const historyApprovals = history
        .map((h) => h.approval)
        .filter(
          (a): a is SignatureResponseData => a !== null && a !== undefined
        );

      return approval ? [approval, ...historyApprovals] : historyApprovals;
    });
  }, [signatories, drafts]);

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
          service === "document_update" || (action && action.is_resource === 1)
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

    setIsLoading(true);

    try {
      const response: ServerResponse | undefined = await funnel.stream(
        repo(serviceName),
        mutatedState
      );

      if (response?.data && updateRaw) {
        if (action?.mode === "destroy") {
          navigate("/desk/folders");
        } else {
          updateRaw(response.data as DocumentResponseData);
        }

        toast.success(response.message);
      } else {
        handleError("Cannot process workflow");
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
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
    async (
      action: DocumentActionResponseData,
      signatory?: SignatoryResponseData
    ) => {
      let serverSideService = service(currentDraft?.document_draftable_type);
      const actionMode = action.is_resource === 1 ? "store" : "update";

      if (
        action.action_status === "passed" &&
        action.category === "signature"
      ) {
        serverSideService = "signature";
      } else if (
        action.action_status === "passed" &&
        action.is_resource === 1 &&
        nextTracker?.document_type?.service
      ) {
        serverSideService = service(nextTracker.document_type.service);
      } else if (
        (action.action_status === "cancelled" ||
          action.action_status === "reversed") &&
        action.mode === "destroy" &&
        action.is_resource === 1
      ) {
        serverSideService = "document_trail";
      } else if (
        action.action_status === "appeal" &&
        action.category === "signature"
      ) {
        serverSideService = "signature_request";
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
          mode:
            serverSideService === "document_update" ||
            serverSideService === "document_trail"
              ? "store"
              : actionMode,
        },
      };

      if (action.is_resource === 1 || action.has_update === 1) {
        openModal(DocumentUpdateModal, serverSideService, {
          title: `${action.name} for ${formatCamelCaseToSpaced(
            extractModelName(currentDraft.document_draftable_type)
          )}`,
          isUpdating:
            serverSideService !== "document_update" || action.is_resource !== 1,
          onSubmit: handleOnSubmit,
          dependencies: [
            [action, currentDraft, nextTracker, resource, signatory],
          ],
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

  return { handleOnSubmit, resolveAction, error, activeSignatory, signatures };
};
