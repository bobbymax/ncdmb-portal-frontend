import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import React from "react";
import Button from "resources/views/components/forms/Button";
import { DocumentControlStateProps } from "resources/views/pages/ViewResourcePage";

const DocumentReverse: React.FC<
  DocumentControlStateProps<ClaimResponseData, ClaimRepository>
> = ({ data, tab, Repo, loading, view }) => {
  return (
    <div className="row">
      <div className="col-md-12">
        {/* Action Description */}
        <div className="reverse__action mb-5">
          <div className="desc__txt">
            <p>
              When you reverse your claim and expenses, you are resetting your
              claim status, and deleting all expenses. This action cannot be
              reversed!!.
            </p>
          </div>
          <Button
            label="Reverse Claim and Expenses"
            handleClick={() => {}}
            variant="danger"
            icon="ri-delete-row"
            size="sm"
          />
        </div>
        <div className="reverse__action">
          <div className="desc__txt">
            <p>
              When you delete the claim, the data will no longer be accessible.
              Perform this action if only you know what your are doing
            </p>
          </div>
          <Button
            label="Delete Claim and Expenses"
            handleClick={() => {}}
            variant="danger"
            icon="ri-close-large-line"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentReverse;
