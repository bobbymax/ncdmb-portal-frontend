import useFileActions from "app/Hooks/useFileActions";
import { DocketDataType } from "app/Hooks/useWorkflowEngine";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import React from "react";

const MediaFilesTab: React.FC<
  DocketDataType<DocumentResponseData, DocumentRepository>
> = ({ uploads, Repo, tab }) => {
  const { mergedPdfUrl } = useFileActions({
    Repo,
    uploads: uploads ?? [],
    tab,
  });

  return (
    <div>
      {mergedPdfUrl && (
        <div style={{ marginTop: "12px" }}>
          <iframe
            src={mergedPdfUrl}
            title="Merged PDF"
            style={{ width: "100%", height: "620px", border: "none" }}
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default MediaFilesTab;
