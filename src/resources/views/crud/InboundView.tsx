import { InboundResponseData } from "@/app/Repositories/Inbound/data";
import { FormPageComponentProps } from "@/bootstrap";
import React, { useEffect } from "react";
import { usePdfMerger } from "app/Hooks/usePdfMerger";
import "resources/assets/css/inbound-view.css";

const InboundView: React.FC<FormPageComponentProps<InboundResponseData>> = ({
  state,
  handleChange,
  dependencies,
}) => {
  // Use the PDF merger hook with state.uploads
  const { mergedPdfUrl, isLoading, error, generateMergedPdf } = usePdfMerger(
    state.uploads
  );

  // Generate merged PDF when uploads are available
  useEffect(() => {
    if (state.uploads && state.uploads.length > 0) {
      generateMergedPdf();
    }
  }, [state.uploads, generateMergedPdf]);

  return (
    <div className="row inbound-view">
      {/* PDF Display */}
      <div className="col-md-6">
        <div className="custom-card pdf-viewer-card">
          <div className="custom-card-header mb-4">
            <div className="flex align gap-sm">
              <div className="icon-badge-red">
                <i className="ri-file-pdf-line" />
              </div>
              <div>
                <h3 className="card-title">Document Preview</h3>
                <p className="card-subtitle">
                  {state.uploads
                    ? `${state.uploads.length} file${
                        state.uploads.length !== 1 ? "s" : ""
                      } merged`
                    : "No documents"}
                </p>
              </div>
            </div>
          </div>
          <div className="custom-card-body">
            {isLoading && (
              <div className="loading-state">
                <div className="loading-spinner">
                  <i className="ri-loader-4-line" />
                </div>
                <div className="loading-content">
                  <p className="loading-title">Merging Documents...</p>
                  <p className="loading-text">
                    Please wait while we combine your PDF files
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger">
                <i className="ri-error-warning-fill" />
                <div>
                  <p className="alert-title">Error Loading PDF</p>
                  <p className="alert-text">{error}</p>
                </div>
              </div>
            )}

            {mergedPdfUrl && !isLoading && !error && (
              <div className="pdf-iframe-container">
                <iframe
                  src={mergedPdfUrl}
                  width="100%"
                  height="600px"
                  title="Merged PDF Preview"
                  className="pdf-iframe"
                />
              </div>
            )}

            {!state.uploads || state.uploads.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="ri-file-pdf-line" />
                </div>
                <div className="empty-state-content">
                  <h3>No Documents Available</h3>
                  <p>Upload PDF files to see them here</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Document Details */}
      <div className="col-md-6">
        <div className="custom-card">
          <div className="custom-card-header mb-4">
            <div className="flex align gap-sm">
              <div className="icon-badge-green">
                <i className="ri-information-line" />
              </div>
              <div>
                <h3 className="card-title">Document Information</h3>
                <p className="card-subtitle">
                  Details about the inbound document
                </p>
              </div>
            </div>
          </div>
          <div className="custom-card-body">{/* AI Analysis */}</div>
        </div>
      </div>
    </div>
  );
};

export default InboundView;
