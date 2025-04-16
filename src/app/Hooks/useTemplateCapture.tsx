import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { DraftTemplate, useWorkflowEngine } from "./useWorkflowEngine";
import html2canvas from "html2canvas";
import {
  DocumentResponseData,
  UploadResponseData,
} from "app/Repositories/Document/data";
import { useAuth } from "app/Context/AuthContext";
import { useFileDeskRoutePipelines } from "./useFileDeskRoutePipelines";
import { BaseResponse } from "app/Repositories/BaseRepository";
import { DocumentDraftResponseData } from "app/Repositories/DocumentDraft/data";
import { WorkflowStageResponseData } from "app/Repositories/WorkflowStage/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { PDFDocument } from "pdf-lib";

const A4 = {
  portrait: { width: 3507, height: 4962 },
  landscape: { width: 4962, height: 3507 },
};

const PADDING_LEFT = 200;
const PADDING_RIGHT = 200;
const PADDING_TOP = 450;
const PADDING_BOTTOM = 450;

const useTemplateCapture = (
  file: DocumentResponseData,
  draftUploads: UploadResponseData[],
  templates: DraftTemplate[]
) => {
  const { staff } = useAuth();
  const [dataUrls, setDataUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    handleUpdateRaw,
  } = useWorkflowEngine(file, staff);

  const { signatures } = useFileDeskRoutePipelines(
    resource as BaseResponse,
    currentDraft as DocumentDraftResponseData,
    needsSignature as boolean,
    currentStage as WorkflowStageResponseData,
    fileState,
    currentTracker as ProgressTrackerResponseData,
    nextTracker as ProgressTrackerResponseData,
    handleUpdateRaw,
    signatories,
    drafts
  );

  const handleSecureFiles = (
    urls: string[],
    uploads: UploadResponseData[]
  ): string[] => {
    // return [...urls, ...uploads.map((upload) => upload.file_path)];
    return urls;
  };

  const fetchSingleFile = (uri: string) => {
    try {
      const base64 = (val: string | undefined | null) =>
        val?.split(",")[1] ?? "";
      const binary = atob(base64(uri));

      const byteArray = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        byteArray[i] = binary.charCodeAt(i);
      }

      return byteArray;
    } catch (error) {
      console.error("Failed to fetch or decode file:", error);
      console.log(error);
      return null;
    }
  };

  const getMimeType = (dataUrl: string): string | null => {
    const match = dataUrl.match(/^data:(.*?);/);
    return match ? match[1] : null;
  };

  const merge = useCallback(async () => {
    if (dataUrls.length < 1 && !draftUploads) return "";

    const mergedPdf = await PDFDocument.create();
    const uris = handleSecureFiles(dataUrls, draftUploads);

    for (const uri of uris) {
      const fileBytes = fetchSingleFile(uri);

      if (!fileBytes) continue;

      if (getMimeType(uri) === "application/pdf") {
        const pdfDoc = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } else if (getMimeType(uri)?.startsWith("image/")) {
        let image;
        if (getMimeType(uri) === "image/jpeg") {
          image = await mergedPdf.embedJpg(fileBytes);
        } else if (getMimeType(uri) === "image/png") {
          image = await mergedPdf.embedPng(fileBytes);
        }

        if (image) {
          const page = mergedPdf.addPage();
          const { width, height } = image.scale(1);
          page.setWidth(width);
          page.setHeight(height);
          page.drawImage(image, { x: 0, y: 0, width, height });
        }
      }
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  }, [dataUrls, draftUploads]);

  useEffect(() => {
    const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const captureAll = async () => {
      setLoading(true);
      await wait(150); // wait for lazy content to resolve

      const containers =
        containerRef.current?.querySelectorAll<HTMLElement>(
          ".template-capture"
        );
      if (!containers) return;

      const urls: string[] = [];

      for (const el of containers) {
        const canvas = await html2canvas(el, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
          width: el.scrollWidth,
          height: el.scrollHeight,
        });

        const img = new Image();
        img.src = canvas.toDataURL("image/png");
        await new Promise((resolve) => (img.onload = resolve));

        const orientation = img.width > img.height ? "landscape" : "portrait";
        const { width, height } = A4[orientation];

        const outputCanvas = document.createElement("canvas");
        const ctx = outputCanvas.getContext("2d");

        const availableWidth = width - PADDING_LEFT - PADDING_RIGHT;
        const availableHeight = height - PADDING_TOP - PADDING_BOTTOM;
        const scaleBoost = 1.05;
        const rawScale = Math.min(
          availableWidth / img.width,
          height / img.height
        );
        const scale = rawScale * scaleBoost;

        const drawWidth = Math.round(img.width * scale);
        const drawHeight = Math.round(img.height * scale);
        const drawX = Math.round(
          PADDING_LEFT + (availableWidth - drawWidth) / 2
        );
        const drawY = Math.round(
          PADDING_TOP + (availableHeight - drawHeight) / 2
        );

        // const dx = PADDING_LEFT + (availableWidth - img.width * scale) / 2;
        // const dy = (height - img.height * scale) / 2;

        outputCanvas.width = Math.round(width);
        outputCanvas.height = Math.round(height);

        ctx!.imageSmoothingEnabled = false;
        ctx?.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          drawX,
          drawY,
          drawWidth,
          drawHeight
        );

        urls.push(outputCanvas.toDataURL("image/png"));
      }

      setDataUrls(urls);
      setLoading(false);
    };

    captureAll();
  }, []);

  useEffect(() => {
    if (uploads.length > 0) {
      const mergeFiles = async () => {
        const url = await merge();
        setPdfUrl(url);
      };

      mergeFiles();
    }
  }, [dataUrls, draftUploads]);

  //   const triggerCapture = () => {
  //     setStartCapture(true);
  //   };

  const hiddenRender = (
    <div
      ref={containerRef}
      style={{ position: "absolute", top: "-9999px", left: "-9999px" }}
    >
      {templates ? (
        templates.map(({ id, component: DraftTemplate }) => (
          <div
            className="template-capture"
            style={{ width: "100%", height: "auto" }}
            key={id}
          >
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
        ))
      ) : (
        <p>No Component exists</p>
      )}
    </div>
  );

  return {
    dataUrls,
    loading,
    hiddenRender,
    merge,
    pdfUrl,
  };
};

export default useTemplateCapture;
