import React, { useMemo } from "react";
import { DraftPageProps } from "../../tabs/FilePagesTab";
import { useDraft } from "app/Hooks/useDraft";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import DocumentDraftRepository from "app/Repositories/DocumentDraft/DocumentDraftRepository";
import { extractModelName } from "bootstrap/repositories";

const NoteComponent: React.FC<
  DraftPageProps<DocumentDraftResponseData, DocumentDraftRepository>
> = ({ draftId, drafts, stage }) => {
  const { current, previous } = useDraft(draftId, drafts);

  const type = useMemo(
    () => extractModelName(previous?.document_draftable_type as string),
    [previous]
  );

  return (
    <div className="card__slips note" style={{ height: "auto" }}>
      <div className="notebook">
        <div className="process__img">
          <img
            src={`https://portal.test${stage?.stage_category?.icon_path}`}
            alt="Stage Icon"
          />
        </div>
        <h2>{stage?.name}</h2>
        {
          <p>
            {previous?.authorising_officer?.name} has{" "}
            {previous?.action?.action_status} this {type} document with ref:{" "}
            {previous?.ref} as part of the process of this workflow.
          </p>
        }
        <div className={`status-bar ${current?.action?.variant}`}>
          {current?.status}
        </div>
      </div>
    </div>
  );
};

export default NoteComponent;
