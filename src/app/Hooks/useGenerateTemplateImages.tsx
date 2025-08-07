import { Suspense, useEffect, useRef, useState } from "react";
import { useWorkflowEngine } from "./useWorkflowEngine";
import html2canvas from "html2canvas";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { useFileDeskRoutePipelines } from "./useFileDeskRoutePipelines";
import { BaseResponse, JsonResponse } from "app/Repositories/BaseRepository";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { useAuth } from "app/Context/AuthContext";
import { captureTemplatesToImages } from "app/Utils/pdfGenerator";

const A4 = {
  portrait: { width: 2480, height: 3508 },
  landscape: { width: 3508, height: 2480 },
};

const useGenerateTemplateImages = (
  file: DocumentResponseData,
  updateRaw?: (data: JsonResponse) => void
) => {
  const { staff } = useAuth();
  const [dataUrls, setDataUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [readyToCapture, setReadyToCapture] = useState(false);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  const {
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
    fileState,
    fill,
    updateServerDataState,
    draftTemplates,
    signatories,
  } = useWorkflowEngine(file, staff);

  const { signatures } = useFileDeskRoutePipelines(
    resource as BaseResponse,
    currentDraft as DocumentDraftResponseData,
    needsSignature as boolean,
    currentStage as WorkflowStageResponseData,
    fileState,
    currentTracker as ProgressTrackerResponseData,
    nextTracker as ProgressTrackerResponseData,
    updateRaw,
    signatories,
    drafts
  );

  // Trigger capture once templates are rendered
  useEffect(() => {
    if (draftTemplates.length > 0) {
      const handleCapture = async () => {
        const urls = await captureTemplatesToImages();
      };

      handleCapture();
    }
  }, [draftTemplates]);

  // console.log(draftTemplates);

  const hiddenRender = (
    <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
      {draftTemplates.map(({ id, component: DraftTemplate }) => (
        <div key={id} className="template-capture">
          <Suspense fallback={<div>Loading...</div>}>
            <DraftTemplate
              data={drafts.find((d) => d.id === id)?.draftable ?? {}}
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
        </div>
      ))}
    </div>
  );

  return { dataUrls, loading, hiddenRender };
};

export default useGenerateTemplateImages;
