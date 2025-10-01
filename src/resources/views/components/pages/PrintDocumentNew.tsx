import React, { useState, useCallback } from "react";
import { useReactPdfBuilder } from "app/Hooks/useReactPdfBuilder";
import PdfViewer from "./PdfViewer";

interface PrintDocumentProps {
  documentState: any; // The document state from A4Sheet
  isLoading: boolean;
  error: string | null;
  onGeneratePrintPdf: () => void;
  className?: string;
}

const PrintDocumentNew: React.FC<PrintDocumentProps> = ({
  documentState,
  isLoading,
  error,
  onGeneratePrintPdf,
  className = "",
}) => {
  const [printPdfUrl, setPrintPdfUrl] = useState<string | null>(null);
  const { generatePDF, isGenerating, error: pdfError } = useReactPdfBuilder();

  const handleGeneratePDF = useCallback(async () => {
    if (!documentState) {
      console.error("No document state available for PDF generation");
      return;
    }

    try {
      console.log("Generating PDF from document state:", documentState);

      // Determine theme based on current theme
      const isDarkTheme =
        document.documentElement.getAttribute("data-theme") === "dark";
      const theme = isDarkTheme ? "dark" : "light";

      const pdfUrl = await generatePDF(documentState, theme);
      setPrintPdfUrl(pdfUrl);

      console.log("PDF generated successfully:", pdfUrl);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  }, [documentState, generatePDF]);

  // Use PdfViewer component for consistency with uploads
  return (
    <PdfViewer
      pdfUrl={printPdfUrl}
      isLoading={isGenerating || isLoading}
      error={error || pdfError}
      onGeneratePdf={handleGeneratePDF}
      className={className}
    />
  );
};

export default PrintDocumentNew;
