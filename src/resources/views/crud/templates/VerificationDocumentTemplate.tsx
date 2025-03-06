import React from "react";
import { DraftPageProps } from "../tabs/FilePagesTab";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { useDraft } from "app/Hooks/useDraft";
import { TabModelProps } from "app/Hooks/useFilePages";

const VerificationDocumentTemplate: React.FC<DraftPageProps<TabModelProps>> = ({
  data,
  draftId,
  updateLocalState,
  drafts,
}) => {
  const { document: claim } = useDraft<ClaimResponseData>(
    data as ClaimResponseData,
    draftId,
    drafts,
    updateLocalState
  );

  return (
    <div className="single__page note">
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
