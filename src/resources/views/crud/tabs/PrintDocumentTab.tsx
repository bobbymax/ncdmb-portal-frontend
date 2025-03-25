import { DocketDataType } from "app/Hooks/useWorkflowEngine";
import { DocumentResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import React, { Suspense, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useFileDeskRoutePipelines } from "app/Hooks/useFileDeskRoutePipelines";

const PrintDocumentTab: React.FC<
  DocketDataType<DocumentResponseData, DocumentRepository>
> = ({
  workflow,
  currentTracker,
  currentDraft,
  drafts,
  group,
  currentStage,
  availableActions,
  docType,
  uploads,
  resource,
  nextTracker,
  needsSignature,
  updateRaw,
  fill,
  updateServerDataState,
  fileState,
  draftTemplates,
  signatories,
  document,
}) => {
  const { signatures } = useFileDeskRoutePipelines(
    resource,
    currentDraft,
    needsSignature,
    currentStage,
    fileState,
    currentTracker,
    nextTracker,
    updateRaw,
    signatories,
    drafts
  );

  const [includeHistory, setIncludeHistory] = useState(false);
  const printRefs = useRef<(HTMLDivElement | null)[]>([]);

  const draftsToPrint = includeHistory
    ? [...(currentDraft.history ?? []), currentDraft]
    : [currentDraft];

  const handlePrint = async () => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    for (let i = 0; i < draftsToPrint.length; i++) {
      const ref = printRefs.current[i];
      if (!ref) continue;

      const canvas = await html2canvas(ref, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(
        pageWidth / canvas.width,
        pageHeight / canvas.height
      );
      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;
      const x = (pageWidth - imgWidth) / 2;
      const y = 20;

      if (i !== 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    }

    pdf.save("draft-document.pdf");
  };

  return (
    <>
      <div
        style={{
          padding: 23,
        }}
        className="print__area"
      >
        {draftTemplates?.length ? (
          draftTemplates.map(({ id, component: DraftTemplateComponent }) => (
            <Suspense key={id} fallback={<div>Loading...</div>}>
              <DraftTemplateComponent
                data={drafts.find((d) => d.id === id)?.draftable}
                draftId={id}
                template={drafts.find((d) => d.id === id)?.template}
                group={group}
                stage={currentStage}
                drafts={drafts}
                tracker={currentTracker}
                workflow={workflow}
                needsSignature={needsSignature}
                nextTracker={nextTracker}
                resource={resource}
                uploads={uploads}
                fill={fill}
                fileState={fileState}
                docType={docType}
                currentDraft={currentDraft}
                updateServerDataState={updateServerDataState}
                signatories={signatories}
                actions={availableActions}
                signatures={signatures}
              />
            </Suspense>
          ))
        ) : (
          <p>No draft templates available</p>
        )}
      </div>
    </>
  );
};

export default PrintDocumentTab;
