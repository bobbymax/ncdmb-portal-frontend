import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { useResourceContext } from "app/Context/ResourceContext";
import SignatureCanvas from "../capsules/SignatureCanvas";
import { SignatureResponseData } from "app/Repositories/Signature/data";
import { CategoryProgressTrackerProps } from "app/Repositories/DocumentCategory/data";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";
import { SheetProps } from "resources/views/pages/DocumentTemplateContent";
import { SelectedActionsProps } from "../../crud/DocumentCategoryConfiguration";
import { UserResponseData } from "@/app/Repositories/User/data";
import { scopes } from "app/Hooks/usePolicy";
import MultiSelect, { DataOptionsProps } from "../forms/MultiSelect";
import { ActionMeta } from "react-select";
import { formatOptions } from "app/Support/Helpers";

interface SignatureContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
  currentTracker: CategoryProgressTrackerProps | null;
  currentPageActions: SelectedActionsProps[];
  uplines: (
    scope?: keyof typeof scopes,
    flag?: "group" | "grade",
    group_id?: number
  ) => UserResponseData[];
}

const SignatureContentCard: React.FC<SignatureContentCardProps> = ({
  item,
  onClose,
  isEditing,
  currentTracker,
  currentPageActions,
  uplines,
}) => {
  const { state, actions } = usePaperBoard();
  const { getResourceById } = useResourceContext();
  // Use ref to track previous configState to detect actual changes
  const previousConfigState = useRef<ProcessFlowConfigProps | null>(null);

  // Get stages that should be signed from configState
  const signableStages: CategoryProgressTrackerProps[] = useMemo(() => {
    const stages: CategoryProgressTrackerProps[] = [];
    if (state.configState) {
      // "from" must always be first (top or left)
      if (
        state.configState.from &&
        state.configState.from.should_be_signed === "yes"
      ) {
        stages.push({
          ...state.configState.from,
          order: stages.length + 1,
          flow_type: "from",
        });
      }
      if (
        state.configState.through &&
        state.configState.through.should_be_signed === "yes"
      ) {
        stages.push({
          ...state.configState.through,
          order: stages.length + 1,
          flow_type: "through",
        });
      }
      if (
        state.configState.to &&
        state.configState.to.should_be_signed === "yes"
      ) {
        stages.push({
          ...state.configState.to,
          order: stages.length + 1,
          flow_type: "to",
        });
      }
    }
    return stages;
  }, [state.configState]);

  const signatureButton: SelectedActionsProps | null = useMemo(() => {
    if (signableStages.length === 0) return null;
    return (
      currentPageActions.find(
        (page) =>
          page.identifier === currentTracker?.identifier &&
          page.action.category === "signature"
      ) ?? null
    );
  }, [currentTracker, currentPageActions, signableStages.length]);

  // Create signature data using actual user information from ResourceContext
  const signatures: SignatureResponseData[] = useMemo(() => {
    if (signableStages.length === 0) return [];
    // Get existing signature data from the item content if it exists
    const existingSignatures =
      (item.content?.signature as any)?.signatures || [];

    return signableStages.map(
      (stage: CategoryProgressTrackerProps, index: number) => {
        // Find the user from ResourceContext based on stage.user_id
        const user = getResourceById("users", stage.user_id);

        // Find existing signature for this stage
        const existingSignature = existingSignatures.find(
          (sig: any) => sig.flow_type === stage.flow_type
        );

        return {
          id: existingSignature?.id || index + 1,
          signatory_id: stage.user_id,
          user_id: stage.user_id,
          document_draft_id: 0, // Will be set when document is created
          type: "signatory" as any, // Default type
          flow_type: stage.flow_type,
          signature: existingSignature?.signature || null,
          user: user || null,
          group_id: stage.group_id,
          order: stage.order,
          approving_officer: user
            ? {
                name:
                  `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                  user.name ||
                  "Unknown User",
                grade_level: user.grade_level || "",
              }
            : {
                name: `User ID: ${stage.user_id}`,
                grade_level: "",
              },
        } as SignatureResponseData;
      }
    );
  }, [
    signableStages,
    getResourceById,
    (item.content?.signature as any)?.signatures,
  ]);

  // Use ref to access current signatures without causing re-renders
  const signaturesRef = useRef<SignatureResponseData[]>(signatures);

  // Update ref when signatures change
  useEffect(() => {
    signaturesRef.current = signatures;
  }, [signatures]);

  const currentSignature: SignatureResponseData | null = useMemo(() => {
    return (
      signatures.find(
        (signature) =>
          signature.flow_type === currentTracker?.flow_type &&
          state.loggedInUser?.id === signature.user_id
      ) ?? null
    );
  }, [signatures, currentTracker, state.loggedInUser]);

  // Handle signature save callback - use ref to avoid circular dependencies
  const handleSignatureSave = useCallback(
    (signatureData: string, signatureId: number) => {
      // Get current signatures from ref to avoid stale closure
      const currentSignatures = signaturesRef.current;
      const updatedSignatures = currentSignatures.map((sig) =>
        sig.id === signatureId ? { ...sig, signature: signatureData } : sig
      );

      // Update the item content with new signature data
      const updatedItem = {
        ...item,
        content: {
          id: item.id,
          order: item.order,
          signature: {
            signatures: updatedSignatures,
          },
        } as SheetProps,
      };

      // Update the body with the new signature data
      const newBody = state.body.map((bodyItem) =>
        bodyItem.id === item.id ? updatedItem : bodyItem
      );

      actions.setBody(newBody);
    },
    [item, state.body, actions]
  );

  // Update global state with signature data when configState or signatures change
  useEffect(() => {
    // Check if configState has actually changed
    const configStateChanged =
      JSON.stringify(previousConfigState.current) !==
      JSON.stringify(state.configState);

    if (
      signatures.length > 0 &&
      (configStateChanged || !previousConfigState.current)
    ) {
      const updatedItem = {
        ...item,
        content: {
          id: item.id,
          order: item.order,
          signature: {
            signatures,
          },
        } as SheetProps,
      };

      const newBody = state.body.map((bodyItem) =>
        bodyItem.id === item.id ? updatedItem : bodyItem
      );

      actions.setBody(newBody);

      // Update the ref to track the current configState
      previousConfigState.current = state.configState;
    }
  }, [signatures, item.id, actions, state.configState]);

  // Memoize signature display to avoid context re-renders
  const signatureDisplay = useMemo(() => {
    return state.category?.template?.signature_display;
  }, [state.category?.template?.signature_display]);

  // Early return after all hooks are called
  if (signableStages.length === 0) {
    return null; // No stages to sign
  }

  // Check if logged-in user is assigned to "from" AND also to "through" or "to"
  const canChangeSignatories = useMemo(() => {
    const loggedInUserId = state.loggedInUser?.id;

    if (!loggedInUserId || !state.configState) return false;

    const fromUserId = state.configState.from?.user_id;
    const throughUserId = state.configState.through?.user_id;
    const toUserId = state.configState.to?.user_id;

    // Show MultiSelect only if logged-in user is in "from" AND ("through" or "to")
    const isInFrom = fromUserId === loggedInUserId;
    const isInThroughOrTo =
      throughUserId === loggedInUserId || toUserId === loggedInUserId;

    return isInFrom && isInThroughOrTo;
  }, [state.configState, state.loggedInUser?.id]);

  // Check for duplicate user_ids between flow types
  const duplicateUserIds = useMemo(() => {
    const duplicates: { flowType: string; userId: number }[] = [];

    if (state.configState) {
      const fromUserId = state.configState.from?.user_id;

      if (fromUserId) {
        // Check if "from" user_id matches "through" user_id
        if (
          state.configState.through?.user_id &&
          state.configState.through.user_id === fromUserId
        ) {
          duplicates.push({ flowType: "through", userId: fromUserId });
        }

        // Check if "from" user_id matches "to" user_id
        if (
          state.configState.to?.user_id &&
          state.configState.to.user_id === fromUserId
        ) {
          duplicates.push({ flowType: "to", userId: fromUserId });
        }
      }
    }

    return duplicates;
  }, [state.configState]);

  const [selectedUplines, setSelectedUplines] = useState<{
    through: DataOptionsProps | null;
    to: DataOptionsProps | null;
  }>({
    through: null,
    to: null,
  });

  // Get uplines for the current scope
  const availableUplines = useMemo(() => {
    // if (!state.category?.scope) return [];
    return uplines();
  }, [state.category?.scope, uplines]);

  const handleUplineChange = useCallback(
    (flowType: "through" | "to") =>
      (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
        const selectedUser = newValue as DataOptionsProps | null;

        setSelectedUplines((prev) => ({ ...prev, [flowType]: selectedUser }));

        // Update configState with the new user_id
        if (selectedUser && state.configState?.[flowType]) {
          const updatedTracker = {
            ...state.configState[flowType],
            user_id: selectedUser.value,
          };

          actions.setConfigState({
            ...state.configState,
            [flowType]: updatedTracker,
          });
        }
      },
    [state.configState, actions]
  );

  if (isEditing) {
    // Disable editing if document already exists
    if (state.existingDocument) {
      return (
        <div className="inline__content__card signature__card">
          <div className="inline__card__header">
            <h5>Signature Configuration</h5>
          </div>
          <div className="inline__card__body">
            <p className="text-muted">
              <i className="ri-lock-line me-2"></i>
              Signatures cannot be edited for existing documents.
            </p>
          </div>
        </div>
      );
    }

    // Only show configuration if logged-in user is in "through" or "to" flow types
    if (!canChangeSignatories) {
      return (
        <div className="inline__content__card signature__card">
          <div className="inline__card__header">
            <h5>Signature Configuration</h5>
          </div>
          <div className="inline__card__body">
            <p className="text-muted">
              <i className="ri-information-line me-2"></i>
              You are not assigned as a signatory for this document stage.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="inline__content__card signature__card">
        <div className="inline__card__header">
          <h5>Signature Configuration</h5>
        </div>
        <div className="inline__card__body">
          {duplicateUserIds.length > 0 && (
            <div className="alert alert-warning mb-3">
              <i className="ri-alert-line me-2"></i>
              <strong>Warning:</strong> Some signatories have the same user
              assigned. Please select different users from the options below.
            </div>
          )}

          <p className="mb-3 text-muted">
            You are assigned as both the initiator and an approver. Please
            reassign the approval stage to a different user:
          </p>

          <div className="row">
            {state.configState?.through &&
              state.configState.through.user_id === state.loggedInUser?.id && (
                <div className="col-md-6 mb-3">
                  <MultiSelect
                    label="Through Signatory (Reassign)"
                    options={formatOptions(availableUplines, "id", "name")}
                    value={selectedUplines.through}
                    onChange={handleUplineChange("through")}
                    placeholder="Select User"
                    isSearchable
                    size="md"
                    description="Select a different user from your uplines to handle this approval stage"
                  />
                </div>
              )}

            {state.configState?.to &&
              state.configState.to.user_id === state.loggedInUser?.id && (
                <div className="col-md-6 mb-3">
                  <MultiSelect
                    label="To Signatory (Reassign)"
                    options={formatOptions(availableUplines, "id", "name")}
                    value={selectedUplines.to}
                    onChange={handleUplineChange("to")}
                    placeholder="Select User"
                    isSearchable
                    size="md"
                    description="Select a different user from your uplines to handle this approval stage"
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  const getContainerClass = () => {
    if (!state.category?.template?.signature_display) {
      return "signature__container__box view__mode";
    }

    switch (state.category.template.signature_display) {
      case "group":
        return "signature__container__box group__mode";
      case "name":
        return "signature__container__box name__mode";
      case "both":
        return "signature__container__box both__mode";
      default:
        return "signature__container__box view__mode";
    }
  };

  return (
    <div className={getContainerClass()}>
      <h3 className="approvals__heading">Approvals</h3>
      <div className="signature__placements flex flex-wrap gap-4">
        {signatures.map((signature: SignatureResponseData) => {
          // Get the group for this specific signature's flow_type
          const groupId =
            state.configState?.[signature?.flow_type ?? "from"]?.group_id;
          const group = groupId ? getResourceById("groups", groupId) : null;

          return (
            <div key={signature.id} className="signature__item">
              <SignatureCanvas
                signatureUrl={signature.signature}
                signature={signature}
                category={state.category}
                tracker={
                  state.configState?.[signature?.flow_type ?? "from"] ?? null
                }
                canSign={
                  state.loggedInUser?.id === signature.user_id &&
                  signature.flow_type === currentTracker?.flow_type
                }
                selectedAction={signatureButton}
                onSignatureSave={(signatureData: string) =>
                  handleSignatureSave(signatureData, signature.id)
                }
                groupName={group?.name}
                templateSignatureDisplay={signatureDisplay}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SignatureContentCard;
