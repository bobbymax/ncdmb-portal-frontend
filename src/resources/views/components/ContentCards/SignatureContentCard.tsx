import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const signatures: SignatureResponseData[] = React.useMemo(
    () =>
      signableStages.map(
        (stage: CategoryProgressTrackerProps, index: number) => {
          // Find the user from state.resources.users based on stage.user_id
          const user = state.resources?.users?.find(
            (u: UserResponseData) => u.id === stage.user_id
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
            signature: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            flow_type: stage.flow_type,
          };
        }
      ),
    [signableStages, state.resources?.users]
  );

  const currentSignature: SignatureResponseData | null = useMemo(() => {
    return (
      signatures.find(
        (signature) =>
          signature.flow_type === currentTracker?.flow_type &&
          state.loggedInUser?.id === signature.user_id
      ) ?? null
    );
  }, [signatures, currentTracker, state.loggedInUser]);

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

  return (
    <div className={getContainerClass()}>
      {signatures.map((signature: SignatureResponseData, index: number) => (
        <div key={signature.id} className="signature__item">
          <div className="signature__button__container">
            {signatureButton &&
              state.loggedInUser?.id === signature.user_id &&
              signature.flow_type === currentTracker?.flow_type && (
                <div className="signature__item__display">
                  <p>{signatureButton.action.button_text}</p>
                </div>
              )}
          </div>
          <SignatureCanvas
            signatureUrl={signature.signature}
            signature={signature}
          />
        </div>
      ))}
    </div>
  );
};

export default SignatureContentCard;
