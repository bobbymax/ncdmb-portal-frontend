import React, { useMemo } from "react";
import { DraftPageProps } from "../../tabs/FilePagesTab";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { useDraft } from "app/Hooks/useDraft";
import DocumentDraftRepository from "app/Repositories/DocumentDraft/DocumentDraftRepository";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";

const VerificationDocumentTemplate: React.FC<
  DraftPageProps<ClaimResponseData, DocumentDraftRepository>
> = ({ data, draftId, drafts, resource: claim }) => {
  // const claim = useMemo(() => resource as ClaimResponseData, []);

  return (
    <div className="card__slips note" style={{ height: "auto" }}>
      <div className="row">
        <div className="col-md-12">
          <div className="note__content flex column gap-md">
            <h2>Verify Claim Note</h2>

            <p style={{ maxWidth: "60%", marginTop: 15 }}>
              <b>{claim.owner?.name}</b> just registered a claim, and would like
              that you take a look to ensure all documentation is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDocumentTemplate;
