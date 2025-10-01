import React, { useState, useCallback, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { PDFDocument, rgb } from "pdf-lib";
import PdfViewer from "./PdfViewer";

interface PrintDocumentProps {
  documentElement: HTMLElement | null; // Reference to the document template element
  isLoading: boolean;
  error: string | null;
  onGeneratePrintPdf: () => void;
  className?: string;
}

const PrintDocument: React.FC<PrintDocumentProps> = ({
  documentElement,
  isLoading,
  error,
  onGeneratePrintPdf,
  className = "",
}) => {
  const [printPdfUrl, setPrintPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [snapshotDataUrl, setSnapshotDataUrl] = useState<string | null>(null);
  const [captureProgress, setCaptureProgress] = useState({
    currentPage: 0,
    totalPages: 0,
    isCapturing: false,
    currentAction: "",
  });

  // Animated snapshot with A4 pagination
  const takeAnimatedSnapshot = useCallback(async () => {
    if (!documentElement) {
      console.log("No document element available for snapshot");
      return;
    }

    try {
      console.log("Starting animated snapshot process...");

      // Find the A4 sheet element and its child elements
      const a4SheetElement = documentElement.querySelector(
        ".a4__sheet"
      ) as HTMLElement;
      if (!a4SheetElement) {
        console.error("A4 sheet element not found");
        return;
      }

      // Find sheet header and content elements
      const sheetHeader = a4SheetElement.querySelector(
        ".sheet__header"
      ) as HTMLElement;
      const sheetContent = a4SheetElement.querySelector(
        ".sheet__content"
      ) as HTMLElement;

      // Store original styles
      const originalDisplay = documentElement.style.display;
      const originalPosition = documentElement.style.position;
      const originalLeft = documentElement.style.left;
      const originalVisibility = documentElement.style.visibility;
      const originalScrollTop = a4SheetElement.scrollTop;
      const originalPadding = documentElement.style.padding;

      // Store original styles for sheet elements
      const originalHeaderPadding = sheetHeader?.style.padding || "";
      const originalContentPadding = sheetContent?.style.padding || "";
      const originalA4SheetHeight = a4SheetElement.style.height;
      const originalA4SheetMaxHeight = a4SheetElement.style.maxHeight;
      const originalA4SheetOverflow = a4SheetElement.style.overflow;

      // Temporarily make element visible for snapshot
      documentElement.style.display = "block";
      documentElement.style.position = "static";
      documentElement.style.left = "auto";
      documentElement.style.visibility = "visible";
      documentElement.style.padding = "0"; // Remove padding to eliminate extra space

      // Remove padding from sheet elements
      if (sheetHeader) sheetHeader.style.padding = "0";
      if (sheetContent) sheetContent.style.padding = "0";

      // Ensure A4Sheet shows all content (remove height restrictions)
      a4SheetElement.style.height = "auto";
      a4SheetElement.style.maxHeight = "none";
      a4SheetElement.style.overflow = "visible";

      // Wait for element to render and content to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      // A4 dimensions in points (standard PDF units)
      const a4Width = 595.28;
      const a4Height = 841.89;

      setCaptureProgress({
        currentPage: 0,
        totalPages: 1,
        isCapturing: true,
        currentAction: "Capturing full document...",
      });

      // Take a snapshot of the A4Sheet element directly
      const documentCanvas = await html2canvas(a4SheetElement, {
        scale: 2, // High resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: a4SheetElement.scrollWidth,
        height: a4SheetElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: a4SheetElement.scrollWidth,
        windowHeight: a4SheetElement.scrollHeight,
        // Ensure we capture the full scrollable content
        x: 0,
        y: 0,
        // Force capture of all content including overflow
        foreignObjectRendering: true,
      });

      console.log(
        "Document canvas:",
        documentCanvas.width,
        "x",
        documentCanvas.height
      );

      // Debug: Check if document canvas has any content
      const documentCtx = documentCanvas.getContext("2d");
      if (documentCtx) {
        const documentImageData = documentCtx.getImageData(
          0,
          0,
          documentCanvas.width,
          documentCanvas.height
        );
        const documentHasContent = documentImageData.data.some(
          (pixel) => pixel !== 0
        );
        console.log("Document canvas has content:", documentHasContent);
      }

      console.log("Document element dimensions:", {
        scrollWidth: documentElement.scrollWidth,
        scrollHeight: documentElement.scrollHeight,
        clientWidth: documentElement.clientWidth,
        clientHeight: documentElement.clientHeight,
        offsetWidth: documentElement.offsetWidth,
        offsetHeight: documentElement.offsetHeight,
      });

      // Since we're capturing A4Sheet directly, we can use the canvas as-is
      const canvas = documentCanvas;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }

      console.log("A4Sheet element dimensions:", {
        scrollWidth: a4SheetElement.scrollWidth,
        scrollHeight: a4SheetElement.scrollHeight,
        clientWidth: a4SheetElement.clientWidth,
        clientHeight: a4SheetElement.clientHeight,
        offsetWidth: a4SheetElement.offsetWidth,
        offsetHeight: a4SheetElement.offsetHeight,
      });

      console.log("A4Sheet canvas:", canvas.width, "x", canvas.height);

      // Debug: Check if canvas has any content
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData.data.some((pixel) => pixel !== 0);
      console.log("Canvas has content:", hasContent);

      // Debug: Check canvas data URL
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      console.log("Canvas data URL length:", dataUrl.length);
      console.log(
        "Canvas data URL preview:",
        dataUrl.substring(0, 100) + "..."
      );

      setCaptureProgress({
        currentPage: 1,
        totalPages: 1,
        isCapturing: true,
        currentAction: "Generating single-page PDF...",
      });

      // Create PDF document with single page
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([a4Width, a4Height]);

      // Convert canvas to PNG
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pngImage = await pdfDoc.embedPng(imgData);

      // Calculate scaling to fit the entire A4Sheet within A4 page boundaries
      const imageWidth = canvas.width;
      const imageHeight = canvas.height;

      // Calculate scale to fit within full A4 page (no margins)
      const scaleX = a4Width / imageWidth;
      const scaleY = a4Height / imageHeight;
      const scale = Math.min(scaleX, scaleY); // Use the smaller scale to ensure it fits

      const scaledWidth = imageWidth * scale;
      const scaledHeight = imageHeight * scale;

      // Center the image on the page
      const x = (a4Width - scaledWidth) / 2;
      const y = (a4Height - scaledHeight) / 2;

      console.log("Scaling info:", {
        originalSize: { width: imageWidth, height: imageHeight },
        scaledSize: { width: scaledWidth, height: scaledHeight },
        scale: scale,
        position: { x: x, y: y },
        a4Size: { width: a4Width, height: a4Height },
      });

      // Draw the entire A4Sheet image on the single page
      page.drawImage(pngImage, {
        x: x,
        y: y,
        width: scaledWidth,
        height: scaledHeight,
      });

      // No page number needed for single page

      // Restore original styles
      documentElement.style.display = originalDisplay;
      documentElement.style.position = originalPosition;
      documentElement.style.left = originalLeft;
      documentElement.style.visibility = originalVisibility;
      documentElement.style.padding = originalPadding;
      a4SheetElement.scrollTop = originalScrollTop;

      // Restore original styles for sheet elements
      if (sheetHeader) sheetHeader.style.padding = originalHeaderPadding;
      if (sheetContent) sheetContent.style.padding = originalContentPadding;

      // Restore A4Sheet original styles
      a4SheetElement.style.height = originalA4SheetHeight;
      a4SheetElement.style.maxHeight = originalA4SheetMaxHeight;
      a4SheetElement.style.overflow = originalA4SheetOverflow;

      // Remove scanning animation CSS
      const scanStyle = document.getElementById("scan-animation");
      if (scanStyle) scanStyle.remove();

      setCaptureProgress({
        currentPage: 1,
        totalPages: 1,
        isCapturing: false,
        currentAction: "Generating PDF...",
      });

      // Generate final PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setPrintPdfUrl(url);
      setCaptureProgress({
        currentPage: 0,
        totalPages: 0,
        isCapturing: false,
        currentAction: "Complete!",
      });

      console.log("Animated PDF generation complete!");
    } catch (err) {
      console.error("Error in animated snapshot:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Animated snapshot error details:", errorMessage);

      setCaptureProgress({
        currentPage: 0,
        totalPages: 0,
        isCapturing: false,
        currentAction: "Error occurred",
      });
    }
  }, [documentElement]);

  const generatePrintPdf = useCallback(async () => {
    console.log("Starting animated PDF generation...");

    if (!documentElement) {
      console.error("No document element available");
      alert("No document element available for PDF generation.");
      return;
    }

    setIsGenerating(true);

    try {
      // Start the animated snapshot process
      await takeAnimatedSnapshot();
    } catch (err) {
      console.error("Error in PDF generation:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Error generating PDF: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, [documentElement, takeAnimatedSnapshot]);

  // Show animated progress during capture
  if (captureProgress.isCapturing) {
    const progressPercentage =
      captureProgress.totalPages > 0
        ? (captureProgress.currentPage / captureProgress.totalPages) * 100
        : 0;

    return (
      <div className={`pdf-viewer ${className}`}>
        <div className="pdf-viewer__loading">
          <div className="loading-spinner">
            <i className="ri-loader-4-line animate-spin"></i>
          </div>
          <div className="capture-progress">
            <h3>🎬 Animated PDF Generation</h3>
            <p className="current-action">{captureProgress.currentAction}</p>

            {captureProgress.totalPages > 0 && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  Page {captureProgress.currentPage} of{" "}
                  {captureProgress.totalPages}
                  <span className="progress-percentage">
                    ({Math.round(progressPercentage)}%)
                  </span>
                </div>
              </div>
            )}

            <div className="capture-features">
              <div className="feature">
                <i className="ri-scanner-line"></i>
                <span>Scanning line effect</span>
              </div>
              <div className="feature">
                <i className="ri-file-paper-line"></i>
                <span>A4 pagination</span>
              </div>
              <div className="feature">
                <i className="ri-hd-line"></i>
                <span>High resolution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use PdfViewer component for consistency with uploads
  return (
    <PdfViewer
      pdfUrl={printPdfUrl}
      isLoading={isGenerating}
      error={error}
      onGeneratePdf={generatePrintPdf}
      className={className}
    />
  );
};

export default PrintDocument;
