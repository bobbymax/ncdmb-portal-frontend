import React from "react";
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { DocumentControlStateProps } from "resources/views/pages/ViewResourcePage";

const DocumentUpdates: React.FC<
  DocumentControlStateProps<ClaimResponseData, ClaimRepository>
> = ({ data, tab, Repo, loading, view }) => {
  return <div>DocumentUpdates</div>;
};

export default DocumentUpdates;
