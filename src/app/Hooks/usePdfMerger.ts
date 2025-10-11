import { useState, useCallback, useEffect, useRef } from "react";
import { PDFDocument, rgb } from "pdf-lib";

interface UploadData {
  id: string | number;
  file_path: string;
  name?: string;
  mime_type?: string;
  extension?: string;
}

interface UsePdfMergerReturn {
  mergedPdfUrl: string | null;
  isLoading: boolean;
  error: string | null;
  generateMergedPdf: () => Promise<void>;
  clearPdf: () => void;
}

export const usePdfMerger = (
  uploads: UploadData[] | undefined
): UsePdfMergerReturn => {
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processedUploadsRef = useRef<string>("");

  const convertDataUrlToPdf = async (
    dataUrl: string,
    fileName?: string
  ): Promise<PDFDocument> => {
    try {
      // Check if it's already a PDF
      if (dataUrl.includes("data:application/pdf")) {
        const response = await fetch(dataUrl);
        const arrayBuffer = await response.arrayBuffer();
        return await PDFDocument.load(arrayBuffer);
      }

      // For non-PDF files, create a new PDF with the file as an image/page
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([612, 792]); // Standard letter size

      // For now, we'll create a placeholder page with file info
      // In a real implementation, you might want to convert images to PDF pages
      // or use a library like pdf2pic for document conversion

      const fontSize = 12;
      const text = fileName || "Document";
      const textWidth = text.length * fontSize * 0.6;
      const textHeight = fontSize;

      page.drawText(text, {
        x: (612 - textWidth) / 2,
        y: (792 - textHeight) / 2,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      return pdfDoc;
    } catch (err) {
      console.error("Error converting data URL to PDF:", err);
      throw new Error(`Failed to convert ${fileName || "file"} to PDF`);
    }
  };

  const generateMergedPdf = useCallback(async () => {
    if (!uploads || uploads.length === 0) {
      setError("No uploads available to merge");
      setIsLoading(false);
      return;
    }

    // Create a unique identifier for this set of uploads
    const uploadsId = uploads
      .map((u) => `${u.id}-${u.file_path?.slice(0, 50)}`)
      .join("|");

    // Check if we've already processed these uploads
    if (processedUploadsRef.current === uploadsId && mergedPdfUrl) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a new PDF document for merging
      const mergedPdf = await PDFDocument.create();
      let processedCount = 0;

      // Process each upload
      for (const upload of uploads) {
        try {
          if (upload.file_path && upload.file_path.startsWith("data:")) {
            const pdfDoc = await convertDataUrlToPdf(
              upload.file_path,
              upload.name
            );

            // Copy all pages from the source PDF to the merged PDF
            const pages = await mergedPdf.copyPages(
              pdfDoc,
              pdfDoc.getPageIndices()
            );
            pages.forEach((page) => mergedPdf.addPage(page));
            processedCount++;
          } else {
            console.log("Skipping upload (no valid data URL):", upload);
          }
        } catch (err) {
          console.warn(`Failed to process upload ${upload.id}:`, err);
          // Continue with other files even if one fails
        }
      }

      // Generate the merged PDF as bytes
      const pdfBytes = await mergedPdf.save();

      // Create a blob URL for the merged PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setMergedPdfUrl(url);
      processedUploadsRef.current = uploadsId; // Mark as processed
    } catch (err) {
      console.error("Error generating merged PDF:", err);
      setError("Failed to generate merged PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [uploads, mergedPdfUrl]);

  const clearPdf = useCallback(() => {
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
      setMergedPdfUrl(null);
    }
    setError(null);
    processedUploadsRef.current = ""; // Reset processed uploads
  }, [mergedPdfUrl]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
      }
    };
  }, [mergedPdfUrl]);

  return {
    mergedPdfUrl,
    isLoading,
    error,
    generateMergedPdf,
    clearPdf,
  };
};
