import { InboundResponseData } from "@/app/Repositories/Inbound/data";
import { FormPageComponentProps } from "@/bootstrap";
import React, { useState, useEffect } from "react";
import {
  useInboundAnalysisListener,
  AnalysisStep,
} from "app/Hooks/useInboundAnalysisListener";
import { toast } from "react-toastify";

const InboundAnalysis: React.FC<
  FormPageComponentProps<InboundResponseData>
> = ({ state, setState, handleChange, dependencies }) => {
  const [selectedProvider, setSelectedProvider] = useState<
    "openai" | "huggingface"
  >("openai");

  const { analysis, isAnalyzing, error, loadingStep, triggerAnalysis } =
    useInboundAnalysisListener(state.id);

  // Update parent state when analysis completes
  useEffect(() => {
    if (analysis && setState) {
      setState((prev) => ({
        ...prev,
        analysis: analysis,
      }));
    }
  }, [analysis, setState]);

  // Show toast notifications for success/error
  useEffect(() => {
    if (loadingStep === "done" && analysis) {
      toast.success("AI analysis completed successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [loadingStep, analysis]);

  useEffect(() => {
    if (error) {
      toast.error(error.split("\n")[0], {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [error]);

  // Use state.analysis if available from database
  const displayAnalysis = analysis || (state.analysis as any);

  const handleAnalyze = async () => {
    console.log("🎯 Starting analysis...", {
      selectedProvider,
      inboundId: state.id,
      isAnalyzing,
    });
    await triggerAnalysis(selectedProvider);
  };

  // Debug: Log loading state changes
  useEffect(() => {
    console.log("📊 Loading state:", {
      isAnalyzing,
      loadingStep,
      hasError: !!error,
      errorMessage: error,
      hasAnalysis: !!displayAnalysis,
    });
  }, [isAnalyzing, loadingStep, error, displayAnalysis]);

  const getLoadingMessage = (step: AnalysisStep): string => {
    switch (step) {
      case "queueing":
        return "Queueing analysis job...";
      case "extracting":
        return "Extracting text from PDF...";
      case "analyzing":
        return `Analyzing with ${
          selectedProvider === "openai" ? "OpenAI" : "HuggingFace"
        }...`;
      case "completing":
        return "Finalizing results...";
      default:
        return "Processing...";
    }
  };

  return (
    <div className="inbound-analysis-tab" style={{ padding: "1rem" }}>
      {/* Compact Header with Provider Selection */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div>
          <h6
            style={{
              margin: 0,
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            AI Analysis
          </h6>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            value={selectedProvider}
            onChange={(e) =>
              setSelectedProvider(e.target.value as "openai" | "huggingface")
            }
            disabled={isAnalyzing}
            style={{
              fontSize: "0.75rem",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              backgroundColor: "white",
              color: "#374151",
            }}
          >
            <option value="openai">OpenAI</option>
            <option value="huggingface">HuggingFace</option>
          </select>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !state.id}
            style={{
              fontSize: "0.75rem",
              padding: "0.375rem 0.75rem",
              borderRadius: "4px",
              border: "none",
              backgroundColor: isAnalyzing ? "#9ca3af" : "#137547",
              color: "white",
              cursor: isAnalyzing ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              fontWeight: 500,
            }}
          >
            {isAnalyzing ? (
              <>
                <i
                  className="ri-loader-4-line spinning"
                  style={{ fontSize: "0.875rem" }}
                />
                Analyzing
              </>
            ) : (
              <>
                <i
                  className="ri-sparkling-line"
                  style={{ fontSize: "0.875rem" }}
                />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading State with Streaming Steps */}
      {isAnalyzing && (
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#f9fafb",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Current Step Display */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <i
                className="ri-loader-4-line spinning"
                style={{ fontSize: "1.5rem", color: "#137547" }}
              />
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  {getLoadingMessage(loadingStep)}
                </p>
                <p
                  style={{
                    margin: "0.25rem 0 0 0",
                    fontSize: "0.75rem",
                    color: "#6b7280",
                  }}
                >
                  This may take 30-60 seconds
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {[
                {
                  step: "queueing",
                  label: "Job queued",
                  icon: "ri-play-circle-line",
                },
                {
                  step: "extracting",
                  label: "Text extraction",
                  icon: "ri-file-text-line",
                },
                {
                  step: "analyzing",
                  label: "AI processing",
                  icon: "ri-robot-line",
                },
                {
                  step: "completing",
                  label: "Finalizing",
                  icon: "ri-check-line",
                },
              ].map((item, index) => {
                const stepOrder = [
                  "queueing",
                  "extracting",
                  "analyzing",
                  "completing",
                ];
                const currentIndex = stepOrder.indexOf(loadingStep);
                const itemIndex = stepOrder.indexOf(item.step);
                const isComplete = itemIndex < currentIndex;
                const isCurrent = item.step === loadingStep;
                const isPending = itemIndex > currentIndex;

                return (
                  <div
                    key={item.step}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      backgroundColor: isCurrent ? "#d1fae5" : "transparent",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isComplete
                          ? "#137547"
                          : isCurrent
                          ? "#10b981"
                          : "#e5e7eb",
                        color: "white",
                        fontSize: "0.75rem",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {isComplete ? (
                        <i className="ri-check-line"></i>
                      ) : isCurrent ? (
                        <i
                          className="ri-loader-4-line spinning"
                          style={{ fontSize: "0.75rem" }}
                        ></i>
                      ) : (
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                          }}
                        ></span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: isComplete || isCurrent ? "#111827" : "#9ca3af",
                        fontWeight: isCurrent ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            fontSize: "0.875rem",
          }}
        >
          <div
            style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
          >
            <i
              className="ri-error-warning-line"
              style={{ color: "#dc2626", fontSize: "1.125rem" }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: "#991b1b",
                  marginBottom: "0.25rem",
                }}
              >
                Analysis Failed
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#7f1d1d",
                  whiteSpace: "pre-line",
                  lineHeight: 1.5,
                }}
              >
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {displayAnalysis && !isAnalyzing && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Meta Info Row */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {displayAnalysis.documentType && (
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.625rem",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  borderRadius: "12px",
                  fontWeight: 500,
                }}
              >
                {displayAnalysis.documentType}
              </span>
            )}
            {displayAnalysis.urgency && (
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.625rem",
                  backgroundColor:
                    displayAnalysis.urgency === "high"
                      ? "#fee2e2"
                      : displayAnalysis.urgency === "medium"
                      ? "#fef3c7"
                      : "#dbeafe",
                  color:
                    displayAnalysis.urgency === "high"
                      ? "#991b1b"
                      : displayAnalysis.urgency === "medium"
                      ? "#92400e"
                      : "#1e40af",
                  borderRadius: "12px",
                  fontWeight: 500,
                  textTransform: "capitalize",
                }}
              >
                {displayAnalysis.urgency} Priority
              </span>
            )}
            {displayAnalysis.confidence && (
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.625rem",
                  backgroundColor: "#d1fae5",
                  color: "#065f46",
                  borderRadius: "12px",
                  fontWeight: 500,
                }}
              >
                {Math.round((displayAnalysis.confidence || 0) * 100)}%
                Confidence
              </span>
            )}
          </div>

          {/* Summary */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          >
            <h6
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "0.813rem",
                fontWeight: 600,
                color: "#111827",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Summary
            </h6>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "#374151",
                lineHeight: 1.6,
              }}
            >
              {displayAnalysis.summary}
            </p>
          </div>

          {/* Key Features */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          >
            <h6
              style={{
                margin: "0 0 0.75rem 0",
                fontSize: "0.813rem",
                fontWeight: 600,
                color: "#111827",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Key Features
            </h6>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {displayAnalysis.keyFeatures?.map(
                (feature: string, idx: number) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "#4b5563",
                    }}
                  >
                    <i
                      className="ri-check-line"
                      style={{
                        color: "#137547",
                        fontSize: "1rem",
                        flexShrink: 0,
                        marginTop: "0.125rem",
                      }}
                    />
                    <span>{feature}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Organizational Benefits */}
          <div
            style={{
              padding: "1rem",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          >
            <h6
              style={{
                margin: "0 0 0.75rem 0",
                fontSize: "0.813rem",
                fontWeight: 600,
                color: "#111827",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Organizational Benefits
            </h6>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {displayAnalysis.organizationalBenefits?.map(
                (benefit: string, idx: number) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "#4b5563",
                    }}
                  >
                    <i
                      className="ri-checkbox-line"
                      style={{
                        color: "#137547",
                        fontSize: "1rem",
                        flexShrink: 0,
                        marginTop: "0.125rem",
                      }}
                    />
                    <span>{benefit}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Suggested Actions */}
          {displayAnalysis.suggestedActions &&
            displayAnalysis.suggestedActions.length > 0 && (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "6px",
                }}
              >
                <h6
                  style={{
                    margin: "0 0 0.75rem 0",
                    fontSize: "0.813rem",
                    fontWeight: 600,
                    color: "#166534",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Recommended Actions
                </h6>
                <ul
                  style={{
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {displayAnalysis.suggestedActions.map(
                    (action: string, idx: number) => (
                      <li
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                          color: "#166534",
                        }}
                      >
                        <i
                          className="ri-arrow-right-s-line"
                          style={{
                            color: "#16a34a",
                            fontSize: "1rem",
                            flexShrink: 0,
                            marginTop: "0.125rem",
                          }}
                        />
                        <span>{action}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Empty State */}
      {!displayAnalysis && !isAnalyzing && !error && (
        <div
          style={{
            padding: "3rem 1.5rem",
            textAlign: "center",
            backgroundColor: "#f9fafb",
            borderRadius: "6px",
            border: "1px dashed #d1d5db",
          }}
        >
          <i
            className="ri-robot-line"
            style={{
              fontSize: "2.5rem",
              color: "#9ca3af",
              marginBottom: "0.75rem",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "#6b7280",
              lineHeight: 1.5,
            }}
          >
            No analysis available. Click &quot;Analyze&quot; to generate
            insights.
          </p>
        </div>
      )}
    </div>
  );
};

export default InboundAnalysis;
