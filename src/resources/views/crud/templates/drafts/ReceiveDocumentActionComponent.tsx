import React from "react";
import { DraftPageProps } from "../../tabs/FilePagesTab";
import { useDraft } from "app/Hooks/useDraft";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import DocumentDraftRepository from "app/Repositories/DocumentDraft/DocumentDraftRepository";

const ReceiveDocumentActionComponent: React.FC<
  DraftPageProps<DocumentDraftResponseData, DocumentDraftRepository>
> = ({ data, draftId, drafts, workflow, tracker, currentDraft }) => {
  // const { currentDraft } = useDraft(data, draftId, drafts);
  return (
    <div className="card__slips note" style={{ height: "auto" }}>
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
