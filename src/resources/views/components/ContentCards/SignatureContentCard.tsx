import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import SignatureCanvas from "../capsules/SignatureCanvas";
import { SignatureResponseData } from "app/Repositories/Signature/data";
import { CategoryProgressTrackerProps } from "app/Repositories/DocumentCategory/data";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";
import { UserResponseData } from "@/app/Repositories/User/data";
import { SheetProps } from "../../pages/DocumentTemplateContent";
import { SelectedActionsProps } from "../../crud/DocumentCategoryConfiguration";
import { DocumentActionResponseData } from "@/app/Repositories/DocumentAction/data";
import Button from "../forms/Button";

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
  const [isDisplayed, setIsDisplayed] = useState<boolean>(false);
  // Use ref to track previous configState to detect actual changes
  const previousConfigState = useRef<ProcessFlowConfigProps | null>(null);

  // Get stages that should be signed from configState
  const signableStages: CategoryProgressTrackerProps[] = [];
  if (state.configState) {
    // "from" must always be first (top or left)
    if (
      state.configState.from &&
      state.configState.from.should_be_signed === "yes"
    ) {
      signableStages.push({
        ...state.configState.from,
        order: signableStages.length + 1,
        flow_type: "from",
      });
    }
    if (
      state.configState.through &&
      state.configState.through.should_be_signed === "yes"
    ) {
      signableStages.push({
        ...state.configState.through,
        order: signableStages.length + 1,
        flow_type: "through",
      });
    }
    if (
      state.configState.to &&
      state.configState.to.should_be_signed === "yes"
    ) {
      signableStages.push({
        ...state.configState.to,
        order: signableStages.length + 1,
        flow_type: "to",
      });
    }
  }

  if (signableStages.length === 0) {
    return null; // No stages to sign
  }

  const signatureButton: SelectedActionsProps | null = useMemo(() => {
    return (
      currentPageActions.find(
        (page) =>
          page.identifier === currentTracker?.identifier &&
          page.action.category === "signature"
      ) ?? null
    );
  }, [currentTracker, currentPageActions]);

  // Create signature data using actual user information from state.resources.users
  const signatures: SignatureResponseData[] = React.useMemo(() => {
    // Get existing signature data from the item content if it exists
    const existingSignatures =
      (item.content?.signature as any)?.signatures || [];

    // console.log(existingSignatures);

    return signableStages.map(
      (stage: CategoryProgressTrackerProps, index: number) => {
        // Find the user from state.resources.users based on stage.user_id
        const user = state.resources?.users?.find(
          (u: UserResponseData) => u.id === stage.user_id
        );

        // console.log(user);

        // Check if we have existing signature data for this stage
        const existingSignature = existingSignatures.find(
          (sig: SignatureResponseData) =>
            sig.user_id === stage.user_id && sig.flow_type === stage.flow_type
        );

        return {
          id: index + 1,
          signatory_id: stage.workflow_stage_id,
          order: stage.order,
          user_id: stage.user_id,
          document_draft_id: 1,
          type: stage.signatory_type || "owner",
          approving_officer: {
            name: user?.name || `User ${stage.user_id}`,
            grade_level: user?.grade_level || "Unknown",
          },
          signature: existingSignature?.signature || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          flow_type: stage.flow_type,
        };
      }
    );
  }, [
    signableStages,
    state.resources?.users,
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

  if (state.configState && currentSignature) {
    console.log(state.configState[currentSignature?.flow_type]);
  }

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
    [item, state.body, actions] // No signatures dependency - use ref instead
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

  if (isEditing) {
    return (
      <div className="inline__content__card signature__card">
        <div className="inline__card__header">
          <h5>Signature Configuration</h5>
        </div>
        <div className="inline__card__content">
          <p>Signature configuration coming soon...</p>
          <div className="inline__card__actions">
            <button className="btn__secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View mode - Check if signatures should be displayed
  if (!state.category || state.category.signature_type === "none") {
    return null; // Don't render anything if no signatures
  }

  // console.log(state.category?.signature_type);

  // Determine container class based on signature type
  const getContainerClass = () => {
    switch (state.category?.signature_type) {
      case "flex":
        return "signature__container__box view__mode signature__flex";
      case "boxed":
        return "signature__container__box view__mode signature__boxed";
      case "stacked":
        return "signature__container__box view__mode signature__stacked";
      case "flush":
        return "signature__container__box view__mode signature__flush";
      default:
        return "signature__container__box view__mode";
    }
  };

  // Memoize signature display to avoid context re-renders
  const signatureDisplay = useMemo(() => {
    return state.category?.template?.signature_display;
  }, [state.category?.template?.signature_display]);

  return (
    <div className={getContainerClass()}>
      <h3 className="approvals__heading">Approvals</h3>
      {signatures.map((signature: SignatureResponseData, index: number) => {
        // Get the group for this specific signature's flow_type
        const group = state.resources.groups.find(
          (group) =>
            group.id ===
            state.configState?.[signature?.flow_type ?? "from"]?.group_id
        );

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
