import { DocketDataType } from "app/Hooks/useWorkflowEngine";
import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import useTemplateCapture from "app/Hooks/useTemplateCapture";

const PrintDocumentTab: React.FC<
  DocketDataType<DocumentResponseData, DocumentRepository>
> = ({ document, draftUploads, draftTemplates }) => {
  const { pdfUrl, loading, hiddenRender } = useTemplateCapture(
    document,
    draftUploads ?? [],
    draftTemplates ?? []
  );

  return (
    <>
      <div className="print__area">
        {loading && <p>Loading templates...</p>}
        {hiddenRender}
      </div>

      {pdfUrl && (
        <div style={{ marginTop: "12px" }}>
          <iframe
            src={pdfUrl}
            title="Merged PDF"
            style={{ width: "100%", height: "620px", border: "none" }}
          ></iframe>
        </div>
      )}
    </>
  );
};

export default PrintDocumentTab;
