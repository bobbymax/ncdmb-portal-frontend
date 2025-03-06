import { useAuth } from "app/Context/AuthContext";
import { useModal } from "app/Context/ModalContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { lazy, useCallback, useEffect, useMemo, useState } from "react";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { DocumentActionResponseData } from "app/Repositories/DocumentAction/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { WorkflowResponseData } from "app/Repositories/Workflow/data";
import DocumentUpdateRepository from "app/Repositories/DocumentUpdate/DocumentUpdateRepository";
import Alert from "app/Support/Alert";
import DocumentUpdateModal from "resources/views/crud/modals/DocumentUpdateModal";
import { BaseRepository, JsonResponse } from "app/Repositories/BaseRepository";
import { DraftCardProps } from "./useDraft";

export type TabModelProps = {
  workflow_id?: number;
  document_id?: number;
  authorising_staff_id: number;
  draft_id: number;
  service: string;
  isSigned?: boolean;
  signature?: string;
  state: DraftCardProps;
};

export const useFilePages = <T extends BaseRepository>(
  model: DocumentResponseData,
  drafts: DocumentDraftResponseData[],
  actions: DocumentActionResponseData[],
  currentTracker: ProgressTrackerResponseData | undefined,
  workflow: WorkflowResponseData | undefined,
  Repo: T
) => {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const { staff } = useAuth();
  const documentUpdateRepo = useMemo(() => new DocumentUpdateRepository(), []);
  const isAuthorisingStaff = useMemo(
    () =>
      (actionId: number): boolean => {
        if (
          !currentTracker ||
          !staff ||
          !currentTracker.stage?.append_signature ||
          actionId < 1 ||
          actions.length < 1
        ) {
          return false;
        }

        const action = actions.find((act) => act.id === actionId) ?? null;

        return checkActionPermissions(action);
      },
    [currentTracker, staff, actions]
  );

  const draftTemplates = useMemo(() => {
    return (
      drafts &&
      drafts.map((draft) => {
        const sanitizedComponent =
          draft?.template?.component.replace(/[^a-zA-Z0-9]/g, "") ||
          "FallbackComponent";
        return {
          id: draft.id,
          component: lazy(
            () => import(`resources/views/crud/templates/${sanitizedComponent}`)
          ),
        };
      })
    );
  }, [drafts]);

  const handleDraftUpdate = useCallback(
    (request: string | object) => {
      const data = request as {
        document: DocumentResponseData;
        response: any;
        service: string;
      };
      const body = {
        document_action_id: data.response.document_action_id,
        progress_tracker_id: currentTracker?.id,
        draft_id: data.response.document_draft_id,
        state: {
          resource_id: data.document.documentable?.id,
          draftable_id: data.document.documentable?.id,
        },
      };

      console.log(body);

      closeModal();
      // onDraftUpdate(data.response.document_action_id, "", body, data.service);
    },
    [closeModal, currentTracker]
  );

  const handleDocumentUpdate = useCallback(
    (action: DocumentActionResponseData) => {
      if (action.has_update === 1) {
        openModal(
          DocumentUpdateModal,
          "document-update",
          {
            title: action.name,
            isUpdating: false,
            onSubmit: handleDraftUpdate,
            dependencies: [[action]],
            template: action.component,
            data: model,
          },
          documentUpdateRepo.getState()
        );
      } else {
        Alert.flash(
          "Update Document",
          "warning",
          "You will not be able to reverse this!!"
        ).then(async (result) => {
          if (result.isConfirmed) {
            onDraftUpdate(action.id);
          }
        });
      }
    },
    [handleDraftUpdate, openModal, model, documentUpdateRepo]
  );

  const onDraftUpdate = useCallback(
    async (
      document_action_id: number,
      message?: string,
      data?: object,
      service?: string
    ) => {
      const body = {
        authorising_staff_id: isAuthorisingStaff(document_action_id),
        document_action_id,
        message,
        progress_tracker_id: currentTracker?.id,
      };

      // try {
      //   const response = await Repo.update(
      //     "service-workers",
      //     service ?? tabState.service,
      //     data ?? body
      //   );

      //   if (response.code === 200) {
      //     navigate("/desk/folders");
      //     toast.success(response.message);
      //   }
      // } catch (error) {
      //   console.error(error);
      // }
    },
    [Repo, navigate]
  );

  const checkActionPermissions = useCallback(
    (action: DocumentActionResponseData | null): boolean => {
      if (!currentTracker || !action) return true;

      const { stage, group } = currentTracker;

      // Require signature if stage mandates it and action is "passed"
      // if (
      //   stage?.append_signature &&
      //   !tabState.signature &&
      //   action.action_status === "passed"
      // ) {
      //   return true;
      // }

      // Ensure staff belongs to the required group
      return group
        ? !staff?.groups.some((grp) => grp.label === group.label)
        : true;
    },
    [currentTracker, staff]
  );

  return { draftTemplates };
};
