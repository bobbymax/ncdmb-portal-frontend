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
import { SheetProps } from "../../pages/DocumentTemplateContent";
import { SelectedActionsProps } from "../../crud/DocumentCategoryConfiguration";

interface SignatureContentCardProps {
  item: ContentBlock;
  onClose: () => void;
  isEditing: boolean;
  currentTracker: CategoryProgressTrackerProps | null;
  currentPageActions: SelectedActionsProps[];
}

const SignatureContentCard: React.FC<SignatureContentCardProps> = ({
  item,
  onClose,
  isEditing,
  currentTracker,
  currentPageActions,
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

  if (isEditing) {
    return (
      <div className="inline__content__card signature__card">
        <div className="inline__card__header">
          <h5>Signature Configuration</h5>
        </div>
        <div className="inline__card__body">
          <p>Configure signature settings for this document.</p>
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
  );
};

export default SignatureContentCard;
