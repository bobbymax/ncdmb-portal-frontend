import React from "react";

interface PdfViewerProps {
  pdfUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onGeneratePdf: () => void;
  className?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  isLoading,
  error,
  onGeneratePdf,
  className = "",
}) => {
  if (isLoading) {
    return (
      <div className={`pdf-viewer ${className}`}>
        <div className="pdf-viewer__loading">
          <div className="loading-spinner">
            <i className="ri-loader-4-line animate-spin"></i>
          </div>
          <p>Generating PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pdf-viewer ${className}`}>
        <div className="pdf-viewer__error">
          <div className="error-icon">
            <i className="ri-error-warning-line"></i>
          </div>
          <p>{error}</p>
          <button className="retry-button" onClick={onGeneratePdf}>
            <i className="ri-refresh-line"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className={`pdf-viewer ${className}`}>
        <div className="pdf-viewer__empty">
          <div className="empty-icon">
            <i className="ri-file-upload-line"></i>
          </div>
          <p>No PDF available</p>
          <button className="generate-button" onClick={onGeneratePdf}>
            <i className="ri-file-add-line"></i>
            Generate PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-viewer ${className}`}>
      <div className="pdf-viewer__controls">
        <div className="controls-group">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="control-button"
            title="Open in new tab"
          >
            <i className="ri-external-link-line"></i>
          </a>
          <a
            href={pdfUrl}
            download="merged-document.pdf"
            className="control-button"
            title="Download PDF"
          >
            <i className="ri-download-line"></i>
          </a>
        </div>
      </div>

      <div className="pdf-viewer__document">
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          style={{
            border: "none",
            borderRadius: "8px",
            minHeight: "600px",
          }}
          title="PDF Viewer"
        />
      </div>
    </div>
  );
};

export default PdfViewer;
