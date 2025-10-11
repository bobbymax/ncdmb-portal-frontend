import React, { useState, useMemo } from "react";
import { ProcessGeneratorCardProps } from "../DocumentGeneratorTab/ProcessGeneratorTab";
import { useResourceContext } from "app/Context/ResourceContext";
import { JournalTypeResponseData } from "@/app/Repositories/JournalType/data";
import { PaymentResponseData } from "@/app/Repositories/Payment/data";
import { useNavigate } from "react-router-dom";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import usePolicy from "app/Hooks/usePolicy";

const EmployeeTreasuryClear: React.FC<ProcessGeneratorCardProps> = ({
  processCard,
  currentProcess,
  existingDocument,
  resource,
  userCanHandle,
  currentDraft,
  userHasPermission,
  allowedActions,
  resolve,
}) => {
  const { getResource, loading } = useResourceContext();
  const { actions } = usePaperBoard();
  const navigate = useNavigate();
  const { uplines } = usePolicy();

  // Track expanded payment IDs and their selected journal types
  const [expandedPayments, setExpandedPayments] = useState<Set<number>>(
    new Set()
  );
  const [selectedPayments, setSelectedPayments] = useState<Set<number>>(
    new Set()
  );
  const [paymentJournalTypes, setPaymentJournalTypes] = useState<
    Record<number, number[]>
  >({});
  const [isNavigating, setIsNavigating] = useState(false);

  const journalTypes = getResource("journalTypes") as JournalTypeResponseData[];
  const payments = (existingDocument?.payments || []) as PaymentResponseData[];

  // Filter journal types by document type
  const filteredJournalTypes = useMemo(() => {
    if (!existingDocument?.type || !journalTypes) return [];
    return journalTypes.filter((jt) => jt.category === existingDocument.type);
  }, [journalTypes, existingDocument?.type]);

  // Toggle payment expansion with animation
  const togglePaymentExpansion = (paymentId: number) => {
    setExpandedPayments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  // Toggle payment selection
  const togglePaymentSelection = (paymentId: number) => {
    setSelectedPayments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId);
      } else {
        newSet.add(paymentId);
      }
      return newSet;
    });
  };

  // Toggle journal type for specific payment
  const toggleJournalTypeForPayment = (
    paymentId: number,
    journalTypeId: number
  ) => {
    setPaymentJournalTypes((prev) => {
      const current = prev[paymentId] || [];
      const updated = current.includes(journalTypeId)
        ? current.filter((id) => id !== journalTypeId)
        : [...current, journalTypeId];
      return { ...prev, [paymentId]: updated };
    });
  };

  // Navigate to linked document with state cleanup
  const goToLinkedDocument = (categoryId: number, documentId: number) => {
    // Show loading modal
    setIsNavigating(true);

    // Clear ALL document-related state to prevent flash of old data
    actions.setExistingDocument(null);
    actions.setCurrentPointer(null);
    actions.setAccessLevel("looker");
    actions.setCategory(null); // Reset category
    actions.setTemplate(null); // Reset template (for header)
    actions.setResource(null); // Reset documentable resource
    actions.setBody([]); // Reset document body content
    actions.setMetaData(null); // Reset document metadata
    actions.setThreads([]); // Reset document threads
    actions.setWatchers([]); // Reset document watchers

    // Navigate after brief delay for smooth transition
    setTimeout(() => {
      navigate(
        `/desk/folders/category/${categoryId}/document/${documentId}/edit`
      );
      // Reset navigating state after navigation (in case user goes back)
      setIsNavigating(false);
    }, 800); // Enough time for user to see the "Creating Inquiry Session..." message
  };

  console.log(uplines());

  // Format currency
  const formatCurrency = (
    amount: string | number,
    currency: string = "NGN"
  ): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  // Get context icon and color
  const getContextInfo = (context: string) => {
    const contextMap: Record<
      string,
      { icon: string; color: string; bg: string }
    > = {
      tax: { icon: "ri-file-list-3-line", color: "#dc2626", bg: "#fef2f2" },
      stamp: { icon: "ri-stamp-line", color: "#9333ea", bg: "#faf5ff" },
      commission: { icon: "ri-percent-line", color: "#ea580c", bg: "#fff7ed" },
      holding: { icon: "ri-lock-line", color: "#0891b2", bg: "#ecfeff" },
      gross: {
        icon: "ri-money-dollar-circle-line",
        color: "#16a34a",
        bg: "#f0fdf4",
      },
      net: { icon: "ri-calculator-line", color: "#2563eb", bg: "#eff6ff" },
      reimbursement: {
        icon: "ri-refund-2-line",
        color: "#7c3aed",
        bg: "#f5f3ff",
      },
    };
    return (
      contextMap[context] || {
        icon: "ri-price-tag-3-line",
        color: "#64748b",
        bg: "#f8fafc",
      }
    );
  };

  return (
    <>
      {/* Navigation Loading Modal */}
      {isNavigating && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "32px 48px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
              maxWidth: "400px",
              textAlign: "center",
              animation: "slideUp 0.3s ease",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 20px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(34, 197, 94, 0.3)",
              }}
            >
              <i
                className="ri-file-search-line"
                style={{
                  fontSize: "2rem",
                  color: "white",
                }}
              ></i>
            </div>

            <div
              className="spinner-border text-success mb-3"
              role="status"
              style={{ width: "40px", height: "40px" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>

            <h6
              style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              Creating Inquiry Session...
            </h6>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginBottom: 0,
              }}
            >
              Please wait while we prepare the document
            </p>
          </div>
        </div>
      )}

      <div className="clearance-card">
        <div className="clearance-card-header">
          {/* Header Section */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 info-section-border">
            <div>
              <h5
                className="mb-1"
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "#1e293b",
                }}
              >
                <i
                  className="ri-money-dollar-circle-line me-2"
                  style={{ color: "#22c55e" }}
                ></i>
                {processCard.name}
              </h5>
              <small className="text-muted" style={{ fontSize: "0.85rem" }}>
                Stage {currentProcess.order}: {currentProcess.stage?.name} •{" "}
                {payments.length} payment(s)
                {selectedPayments.size > 0 && (
                  <span
                    className="ms-2"
                    style={{
                      color: "#22c55e",
                      fontWeight: "600",
                    }}
                  >
                    • {selectedPayments.size} selected
                  </span>
                )}
              </small>
            </div>
            {payments.length > 0 && (
              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedPayments.size === payments.length) {
                      setSelectedPayments(new Set());
                    } else {
                      setSelectedPayments(new Set(payments.map((p) => p.id)));
                    }
                  }}
                  className="btn btn-sm btn-outline-success"
                  style={{
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontWeight: "500",
                    padding: "4px 12px",
                  }}
                >
                  <i
                    className={
                      selectedPayments.size === payments.length
                        ? "ri-checkbox-line me-1"
                        : "ri-checkbox-blank-line me-1"
                    }
                  ></i>
                  {selectedPayments.size === payments.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
            )}
          </div>

          {payments.length === 0 ? (
            <div className="no-payments-state">
              <i className="ri-folder-warning-line mb-3"></i>
              <h6>No Payments Found</h6>
              <p className="mb-0 text-center px-4">
                Payments are necessary to complete this process. Please ensure
                payments have been created for this batch.
              </p>
            </div>
          ) : (
            <div
              className="payments-list"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {payments.map((payment) => {
                const isExpanded = expandedPayments.has(payment.id);
                const isSelected = selectedPayments.has(payment.id);
                const selectedJTs = paymentJournalTypes[payment.id] || [];
                const hasHolding = selectedJTs.some((jtId) => {
                  const jt = filteredJournalTypes.find((j) => j.id === jtId);
                  return jt?.context === "holding";
                });

                return (
                  <div
                    key={payment.id}
                    className={isExpanded ? "payment-card-expanded" : ""}
                    style={{
                      borderRadius: "12px",
                      border: isSelected
                        ? "2px solid #22c55e"
                        : "2px solid #e2e8f0",
                      backgroundColor: "white",
                      overflow: "hidden",
                      boxShadow: isExpanded
                        ? "0 8px 24px rgba(0, 0, 0, 0.12)"
                        : "0 2px 8px rgba(0, 0, 0, 0.06)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {/* Payment Header - Clickable */}
                    <div
                      onClick={() => togglePaymentExpansion(payment.id)}
                      style={{
                        padding: "16px 20px",
                        cursor: "pointer",
                        backgroundColor: isExpanded
                          ? "#f0fdf4"
                          : isSelected
                          ? "#f0fdf4"
                          : "white",
                        borderBottom: isExpanded ? "1px solid #bbf7d0" : "none",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between gap-3">
                        {/* Checkbox */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <div className="position-relative">
                            <input
                              type="checkbox"
                              id={`payment-select-${payment.id}`}
                              className="journal-type-checkbox"
                              checked={isSelected}
                              onChange={() =>
                                togglePaymentSelection(payment.id)
                              }
                              style={{
                                cursor: "pointer",
                              }}
                            />
                            {isSelected && (
                              <i
                                className="ri-check-line"
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  color: "white",
                                  fontSize: "14px",
                                  pointerEvents: "none",
                                  fontWeight: "bold",
                                }}
                              ></i>
                            )}
                          </div>
                        </div>

                        {/* Left: Payment Info */}
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-3 mb-2">
                            <div
                              className="d-flex align-items-center justify-content-center"
                              style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "10px",
                                background:
                                  "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                color: "white",
                                fontSize: "1.1rem",
                                fontWeight: "600",
                                boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
                              }}
                            >
                              <i className="ri-currency-line"></i>
                            </div>
                            <div className="flex-grow-1">
                              <h6
                                className="mb-1"
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: "600",
                                  color: "#1f2937",
                                }}
                              >
                                {payment.expenditure?.linked_document
                                  ?.published_by?.name ||
                                  payment.beneficiary ||
                                  "Unknown Beneficiary"}
                              </h6>
                              <div
                                className="d-flex align-items-center gap-2 text-muted"
                                style={{ fontSize: "0.8rem" }}
                              >
                                {payment.expenditure?.linked_document
                                  ?.published_by?.staff_no && (
                                  <span className="d-flex align-items-center">
                                    <i className="ri-user-line me-1"></i>
                                    {
                                      payment.expenditure.linked_document
                                        .published_by.staff_no
                                    }
                                  </span>
                                )}
                                {payment.expenditure?.linked_document
                                  ?.published_by?.department && (
                                  <>
                                    {payment.expenditure?.linked_document
                                      ?.published_by?.staff_no && (
                                      <span style={{ opacity: 0.5 }}>•</span>
                                    )}
                                    <span>
                                      {
                                        payment.expenditure.linked_document
                                          .published_by.department
                                      }
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Center: Amount */}
                        <div className="text-end">
                          <div
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: "700",
                              color: "#1f2937",
                            }}
                          >
                            {formatCurrency(
                              payment.total_approved_amount,
                              payment.currency
                            )}
                          </div>
                          <div className="d-flex align-items-center justify-content-end gap-1 mt-1">
                            <span
                              className={
                                payment.type === "staff"
                                  ? "badge-type-staff"
                                  : "badge-type-third-party"
                              }
                            >
                              {payment.type}
                            </span>
                            {selectedJTs.length > 0 && (
                              <span className="badge-journal-count">
                                {selectedJTs.length} JT
                              </span>
                            )}
                            {hasHolding && (
                              <span className="badge-holding">
                                <i
                                  className="ri-lock-line"
                                  style={{ fontSize: "0.7rem" }}
                                ></i>{" "}
                                Holding
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Expand Icon */}
                        <div>
                          <div
                            className={`payment-expand-btn ${
                              isExpanded ? "expanded" : ""
                            }`}
                          >
                            <i
                              className={
                                isExpanded
                                  ? "ri-arrow-up-s-line"
                                  : "ri-arrow-down-s-line"
                              }
                            ></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <div
                        className="payment-card-expanded-content"
                        style={{
                          padding: "20px",
                          backgroundColor: "#fafafa",
                          borderTop: "1px solid #e5e7eb",
                        }}
                      >
                        {/* Payment Details Grid */}
                        <div className="row g-3 mb-4">
                          <div className="col-md-4">
                            <label className="payment-detail-label">
                              Payment Method
                            </label>
                            <div className="payment-detail-value">
                              <i className="ri-bank-line"></i>
                              {payment.payment_method
                                ?.replace(/-/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase()) ||
                                "N/A"}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <label className="payment-detail-label">
                              Transaction Type
                            </label>
                            <div className="payment-detail-value">
                              <i className="ri-exchange-line"></i>
                              {payment.transaction_type?.toUpperCase() || "N/A"}
                            </div>
                          </div>
                          <div className="col-md-4">
                            <label className="payment-detail-label">
                              Status
                            </label>
                            <span
                              className={
                                payment.status === "posted"
                                  ? "badge-status-posted"
                                  : "badge-status-draft"
                              }
                            >
                              {payment.status || "Draft"}
                            </span>
                          </div>

                          {payment.expenditure && (
                            <>
                              <div className="col-md-6">
                                <label className="payment-detail-label">
                                  Expenditure Purpose
                                </label>
                                <div
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "#475569",
                                    lineHeight: "1.4",
                                  }}
                                >
                                  {payment.expenditure.purpose || "N/A"}
                                </div>
                              </div>
                              <div className="col-md-6">
                                <label className="payment-detail-label">
                                  Linked Document
                                </label>
                                {payment.expenditure.linked_document
                                  ?.resource_id ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const categoryId =
                                        payment.expenditure!.linked_document!
                                          .document_category_id;
                                      const documentId =
                                        payment.expenditure!.linked_document!
                                          .resource_id;
                                      goToLinkedDocument(
                                        categoryId,
                                        documentId
                                      );
                                    }}
                                    className="btn btn-sm btn-outline-success"
                                    style={{
                                      borderRadius: "8px",
                                      padding: "4px 12px",
                                      fontSize: "0.8rem",
                                      fontWeight: "500",
                                    }}
                                  >
                                    <i className="ri-folder-open-line me-1"></i>
                                    Open File
                                  </button>
                                ) : (
                                  <span
                                    className="text-muted"
                                    style={{ fontSize: "0.85rem" }}
                                  >
                                    No linked document
                                  </span>
                                )}
                              </div>
                            </>
                          )}

                          {payment.narration && (
                            <div className="col-12">
                              <label className="payment-detail-label">
                                Narration
                              </label>
                              <div className="payment-narration">
                                {payment.narration}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Journal Types Section */}
                        <div className="journal-types-section">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="journal-types-title">
                              <i className="ri-list-check-2"></i>
                              Journal Types for this Payment
                            </h6>
                            {selectedJTs.length > 0 && (
                              <span className="badge bg-success badge-selected-count">
                                {selectedJTs.length} selected
                              </span>
                            )}
                          </div>

                          {loading.journalTypes ? (
                            <div className="text-center py-3">
                              <div
                                className="spinner-border spinner-border-sm text-success"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </div>
                          ) : filteredJournalTypes.length === 0 ? (
                            <div
                              className="alert alert-warning mb-0"
                              style={{ fontSize: "0.85rem" }}
                            >
                              <i className="ri-error-warning-line me-2"></i>
                              No journal types available
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              {filteredJournalTypes.map((journalType) => {
                                const isSelected = selectedJTs.includes(
                                  journalType.id
                                );
                                const contextInfo = getContextInfo(
                                  journalType.context
                                );

                                return (
                                  <label
                                    key={journalType.id}
                                    htmlFor={`jt-${payment.id}-${journalType.id}`}
                                    className={`journal-type-item ${
                                      isSelected ? "selected" : ""
                                    }`}
                                  >
                                    {/* Checkbox */}
                                    <div className="position-relative">
                                      <input
                                        type="checkbox"
                                        id={`jt-${payment.id}-${journalType.id}`}
                                        className="journal-type-checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                          toggleJournalTypeForPayment(
                                            payment.id,
                                            journalType.id
                                          )
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      {isSelected && (
                                        <i
                                          className="ri-check-line"
                                          style={{
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            transform: "translate(-50%, -50%)",
                                            color: "white",
                                            fontSize: "14px",
                                            pointerEvents: "none",
                                            fontWeight: "bold",
                                          }}
                                        ></i>
                                      )}
                                    </div>

                                    {/* Icon Badge */}
                                    <div
                                      className="context-icon-badge"
                                      style={{
                                        backgroundColor: contextInfo.bg,
                                      }}
                                    >
                                      <i
                                        className={contextInfo.icon}
                                        style={{
                                          fontSize: "1rem",
                                          color: contextInfo.color,
                                        }}
                                      ></i>
                                    </div>

                                    {/* Journal Type Info */}
                                    <div className="flex-grow-1">
                                      <div className="d-flex align-items-center justify-content-between gap-2">
                                        <div>
                                          <div
                                            style={{
                                              fontSize: "0.9rem",
                                              fontWeight: "600",
                                              color: "#1f2937",
                                            }}
                                          >
                                            {journalType.code}
                                          </div>
                                          {journalType.description && (
                                            <div
                                              className="text-muted"
                                              style={{
                                                fontSize: "0.75rem",
                                                marginTop: "2px",
                                              }}
                                            >
                                              {journalType.description}
                                            </div>
                                          )}
                                        </div>
                                        <div className="d-flex gap-1">
                                          <span
                                            className={
                                              journalType.type === "debit"
                                                ? "badge-jt-debit"
                                                : journalType.type === "credit"
                                                ? "badge-jt-credit"
                                                : "badge-jt-both"
                                            }
                                          >
                                            {journalType.type}
                                          </span>
                                          <span className="badge-context">
                                            {journalType.context}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeTreasuryClear;
