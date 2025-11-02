import { InboundResponseData } from "@/app/Repositories/Inbound/data";
import { FormPageComponentProps } from "@/bootstrap";
import React, { useEffect } from "react";
import { usePdfMerger } from "app/Hooks/usePdfMerger";
import { useInboundAI } from "app/Hooks/useInboundAI";
import InboundAnalysis from "../components/partials/InboundAnalysis";
import InboundInstructions from "../components/partials/InboundInstructions";
import InboundReport from "../components/partials/InboundReport";
import "resources/assets/css/inbound-view.css";
import "resources/assets/css/inbound-tabs.css";

const InboundView: React.FC<FormPageComponentProps<InboundResponseData>> = (
  props
) => {
  const { state, setState, handleChange, dependencies } = props;

  // Use the PDF merger hook with state.uploads
  const { mergedPdfUrl, isLoading, error, generateMergedPdf } = usePdfMerger(
    state.uploads
  );

  // Tab state management
  const [activeTab, setActiveTab] = React.useState<
    "analysis" | "instructions" | "report"
  >("analysis");

  // Generate merged PDF when uploads are available
  useEffect(() => {
    if (state.uploads && state.uploads.length > 0) {
      generateMergedPdf();
    }
  }, [state.uploads, generateMergedPdf]);

  return (
    <div className="row inbound-view">
      {/* PDF Display */}
      <div className="col-md-7">
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
      <div className="col-md-5">
        <div className="custom-card">
          <div className="custom-card-header compact-header">
            <div className="flex align gap-sm">
              <div className="icon-badge-green compact-icon">
                <i className="ri-information-line" />
              </div>
              <div>
                <h3 className="card-title compact-title">
                  Document Information
                </h3>
                <p className="card-subtitle compact-subtitle">
                  Sender details and classification
                </p>
              </div>
            </div>
          </div>

          {/* Tabbed Content Section - Below the compact info */}
          <div className="custom-card-body compact-tabs-wrapper">
            <div className="row">
              <div className="col-md-12">
                <div className="custom-card inbound-tabs-container">
                  {/* Tab Headers */}
                  <div className="inbound-tabs-header">
                    <button
                      className={`tab-button ${
                        activeTab === "analysis" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("analysis")}
                    >
                      <i className="ri-robot-line" />
                      <span>Analysis</span>
                    </button>
                    <button
                      className={`tab-button ${
                        activeTab === "instructions" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("instructions")}
                    >
                      <i className="ri-file-list-3-line" />
                      <span>Instructions</span>
                    </button>
                    <button
                      className={`tab-button ${
                        activeTab === "report" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("report")}
                    >
                      <i className="ri-file-chart-line" />
                      <span>Report</span>
                    </button>
                    <div
                      className="tab-indicator"
                      style={{
                        transform: `translateX(${
                          activeTab === "analysis"
                            ? "0%"
                            : activeTab === "instructions"
                            ? "100%"
                            : "200%"
                        })`,
                      }}
                    />
                  </div>

                  {/* Tab Content */}
                  <div className="inbound-tabs-content">
                    <div
                      className={`tab-pane ${
                        activeTab === "analysis" ? "active" : ""
                      }`}
                    >
                      <InboundAnalysis {...props} />
                    </div>
                    <div
                      className={`tab-pane ${
                        activeTab === "instructions" ? "active" : ""
                      }`}
                    >
                      <InboundInstructions {...props} />
                    </div>
                    <div
                      className={`tab-pane ${
                        activeTab === "report" ? "active" : ""
                      }`}
                    >
                      <InboundReport {...props} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboundView;
