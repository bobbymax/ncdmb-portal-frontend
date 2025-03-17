import React from "react";
import { DraftPageProps } from "../../tabs/FilePagesTab";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import DocumentDraftRepository from "app/Repositories/DocumentDraft/DocumentDraftRepository";

const NoteDraftComponent: React.FC<
  DraftPageProps<DocumentDraftResponseData, DocumentDraftRepository>
> = ({ draftId, drafts, currentDraft }) => {
  return <div>NoteDraftComponent</div>;
};

export default NoteDraftComponent;
