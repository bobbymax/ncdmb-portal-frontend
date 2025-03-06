import React from "react";
import { DraftPageProps } from "../tabs/FilePagesTab";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { useDraft } from "app/Hooks/useDraft";
import { TabModelProps } from "app/Hooks/useFilePages";

const NoteComponent: React.FC<DraftPageProps<TabModelProps>> = ({
  data,
  draftId,
  drafts,
  updateLocalState,
}) => {
  const { document: claim, currentDraft } = useDraft<ClaimResponseData>(
    data as ClaimResponseData,
    draftId,
    drafts,
    updateLocalState
  );

  return (
    <div className="notebook__container">
      <div className="notebook">
        <h2>Claim Verification</h2>
        <p>
          <b>{claim.owner?.name}</b> has submitted this claim for verification.
          Please ensure that all supporting documents and travel dates are
          accurately provided and in compliance with the required standards for
          the Budget Owner’s approval. If the submission does not meet the
          necessary criteria or requires additional information, you may request
          modifications by selecting the “Make Changes” action. Your thorough
          review is essential in maintaining compliance and ensuring a seamless
          approval process. Kindly verify all details before proceeding to the
          next stage of the workflow.
        </p>
        <div className="status-bar">{currentDraft?.status}</div>
      </div>
    </div>
  );
};

export default NoteComponent;
