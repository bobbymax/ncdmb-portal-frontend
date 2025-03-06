import React from "react";
import { DraftPageProps } from "../tabs/FilePagesTab";
import { TabModelProps } from "app/Hooks/useFilePages";
import { useDraft } from "app/Hooks/useDraft";

const ReceiveDocumentActionComponent: React.FC<
  DraftPageProps<TabModelProps>
> = ({ data, draftId, drafts, workflow, tracker, updateLocalState }) => {
  const { currentDraft } = useDraft(data, draftId, drafts, updateLocalState);
  return (
    <div className="notebook__container">
      <div className="notebook">
        <h2>Receive Document</h2>
        <p>
          The document with reference <b>{currentDraft?.ref}</b> has arrived at{" "}
          <b>{tracker?.department?.name}</b> for processing. Review its contents
          for accuracy and compliance with workflow requirements. If corrections
          are needed, request necessary updates. Once verified, acknowledge
          receipt and proceed with the next stage of processing.
        </p>
        <div className="status-bar">{currentDraft?.status}</div>
      </div>
    </div>
  );
};

export default ReceiveDocumentActionComponent;
