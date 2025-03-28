import { DocketDataType } from "app/Hooks/useWorkflowEngine";
import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import React, { Suspense, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useFileDeskRoutePipelines } from "app/Hooks/useFileDeskRoutePipelines";
import { useAuth } from "app/Context/AuthContext";
import useGenerateTemplateImages from "app/Hooks/useGenerateTemplateImages";

const PrintDocumentTab: React.FC<
  DocketDataType<DocumentResponseData, DocumentRepository>
> = ({ updateRaw, document, draftUploads }) => {
  const { dataUrls, hiddenRender } = useGenerateTemplateImages(
    document,
    updateRaw
  );

  // console.log(dataUrls);

  return (
    <>
      <div
        style={{
          padding: 23,
        }}
        className="print__area"
      >
        {/*  */}
      </div>
    </>
  );
};

export default PrintDocumentTab;
