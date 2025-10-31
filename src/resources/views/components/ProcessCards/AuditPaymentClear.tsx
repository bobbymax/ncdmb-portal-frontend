import React, { useState, useMemo, useEffect } from "react";
import { ProcessGeneratorCardProps } from "../DocumentGeneratorTab/ProcessGeneratorTab";
import { PaymentBatchResponseData } from "@/app/Repositories/PaymentBatch/data";
import { PaymentResponseData } from "@/app/Repositories/Payment/data";
import Button from "../forms/Button";
import AuditTrialBalanceDisplay from "./AuditTrialBalanceDisplay";
import { useModal } from "app/Context/ModalContext";
import { useAuth } from "app/Context/AuthContext";
import QueryModal from "../../crud/modals/QueryModal";
import QueryCard from "./QueryCard";

interface PaymentWithQuery extends PaymentResponseData {
  localQuery?: {
    user_id: number;
    group_id: number;
    document_id: number;
    document_draft_id: number;
    message: string;
    response: unknown;
    priority: "low" | "medium" | "high";
    status: "open" | "closed";
    timestamp: string;
  };
}

const AuditPaymentClear: React.FC<ProcessGeneratorCardProps> = ({
  processCard,
  currentProcess,
  existingDocument,
  resource: batch,
  userCanHandle,
  currentDraft,
  userHasPermission,
  allowedActions,
  resolve,
}) => {
  const [expandedPayments, setExpandedPayments] = useState<Set<number>>(
    new Set()
  );
  const [selectedPayments, setSelectedPayments] = useState<Set<number>>(
    new Set()
  );
  const [paymentsWithQueries, setPaymentsWithQueries] = useState<
    PaymentWithQuery[]
  >([]);

  const { openModal, closeModal } = useModal();
  const { staff } = useAuth();

  // Initialize payments with query support
  useEffect(() => {
    const payments = (existingDocument?.payments ||
      []) as PaymentResponseData[];
    setPaymentsWithQueries(
      payments.map((p) => ({ ...p, localQuery: undefined }))
    );
  }, [existingDocument]);

  const payments = useMemo(() => paymentsWithQueries, [paymentsWithQueries]);

  console.log(payments);

  // Toggle payment expansion
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

  // Open Query Modal
  const handleOpenQueryModal = (payment: PaymentWithQuery) => {
    const existingQuery = payment.localQuery;

    openModal(
      QueryModal as any,
      `query-${payment.id}`,
      {
        title: existingQuery ? "Edit Query" : "Query Payment",
        data: existingQuery as any,
        isUpdating: !!existingQuery,
        onSubmit: (
          queryData: any,
          mode: "store" | "update" | "destroy" | "generate"
        ) => {
          handleQueryAttach(payment.id, queryData, payment);
          closeModal();
        },
      },
      existingQuery as any
    );
  };

  // Attach query to payment locally with all required metadata
  const handleQueryAttach = (
    paymentId: number,
    queryData: any,
    payment: PaymentWithQuery
  ) => {
    const fullQueryData = {
      user_id: staff?.id || 0,
      group_id: currentProcess?.group_id || 0,
      document_id: payment.expenditure?.document_id || 0,
      document_draft_id: currentDraft?.id || 0,
      message: queryData.message,
      response: null,
      priority: queryData.priority as "low" | "medium" | "high",
      status: "open" as const,
      timestamp: queryData.timestamp,
    };

    setPaymentsWithQueries((prev) =>
      prev.map((p) =>
        p.id === paymentId ? { ...p, localQuery: fullQueryData } : p
      )
    );
  };

  // Remove query from payment
  const handleQueryRemove = (paymentId: number) => {
    setPaymentsWithQueries((prev) =>
      prev.map((p) =>
        p.id === paymentId ? { ...p, localQuery: undefined } : p
      )
    );
  };

  return (
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
                className="ri-audit-line me-2"
                style={{ color: "#22c55e" }}
              ></i>
              {processCard.name}
            </h5>
            <small className="text-muted" style={{ fontSize: "0.85rem" }}>
              Stage {currentProcess.order}: {currentProcess.stage?.name} •{" "}
              {payments.length} payment(s) for audit
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
              No payments available for audit review. Please check back later.
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
              const hasTransactions =
                payment.transactions && payment.transactions.length > 0;

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
                            onChange={() => togglePaymentSelection(payment.id)}
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
                                "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                              color: "white",
                              fontSize: "1.1rem",
                              fontWeight: "600",
                              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
                            }}
                          >
                            <i className="ri-search-eye-line"></i>
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
                                ?.published_by?.name || "Unknown Beneficiary"}
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

                      {/* Center: Amount & Status */}
                      <div className="text-end">
                        <div
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: "700",
                            color: "#1f2937",
                          }}
                        >
                          {formatCurrency(payment.total_approved_amount, "NGN")}
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
                          {hasTransactions && (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                backgroundColor: "#dbeafe",
                                color: "#1e40af",
                                fontWeight: "600",
                                border: "1px solid #3b82f6",
                              }}
                            >
                              {payment.transactions?.length || 0} Txn
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
                      {/* Trial Balance Display */}
                      {hasTransactions ? (
                        <div className="mb-4">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: "600",
                                color: "#1e293b",
                                margin: 0,
                              }}
                            >
                              <i
                                className="ri-line-chart-line me-2"
                                style={{ color: "#6366f1" }}
                              ></i>
                              Trial Balance
                            </h6>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                backgroundColor: "#ede9fe",
                                color: "#6366f1",
                                fontWeight: "600",
                              }}
                            >
                              {payment.transactions?.length || 0} Transaction(s)
                            </span>
                          </div>
                          <AuditTrialBalanceDisplay
                            transactions={payment.transactions || []}
                            payment={payment}
                          />
                        </div>
                      ) : (
                        <div
                          className="alert alert-info"
                          style={{
                            fontSize: "0.85rem",
                            borderRadius: "8px",
                            marginBottom: "16px",
                          }}
                        >
                          <i className="ri-information-line me-2"></i>
                          No transactions recorded for this payment
                        </div>
                      )}

                      {/* Query Section */}
                      <div
                        className="d-flex flex-column gap-2"
                        style={{
                          paddingTop: "16px",
                          borderTop: "1px solid #e5e7eb",
                        }}
                      >
                        {payment.localQuery ? (
                          <QueryCard
                            query={payment.localQuery}
                            onEdit={() => handleOpenQueryModal(payment)}
                            onDelete={() => handleQueryRemove(payment.id)}
                          />
                        ) : (
                          <div className="d-flex justify-content-end">
                            <Button
                              label="Query Payment"
                              icon="ri-question-line"
                              variant="danger"
                              size="sm"
                              handleClick={() => handleOpenQueryModal(payment)}
                            />
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

        {/* Action Buttons Section */}
        {selectedPayments.size > 0 && (
          <div className="clearance-actions">
            <div className="clearance-summary">
              <div className="summary-item">
                <i className="ri-checkbox-multiple-line"></i>
                <span>{selectedPayments.size} Payment(s) Selected</span>
              </div>
              <div className="summary-item">
                <i className="ri-exchange-line"></i>
                <span>
                  {payments
                    .filter((p) => selectedPayments.has(p.id))
                    .reduce(
                      (total, p) => total + (p.transactions?.length || 0),
                      0
                    )}{" "}
                  Transaction(s)
                </span>
              </div>
              <div className="summary-item">
                <i className="ri-money-dollar-circle-line"></i>
                <span>
                  {formatCurrency(
                    payments
                      .filter((p) => selectedPayments.has(p.id))
                      .reduce(
                        (sum, p) => sum + Number(p.total_approved_amount),
                        0
                      )
                  )}
                </span>
              </div>
            </div>

            <div className="action-buttons">
              {allowedActions?.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    // Collect selected payments with their queries
                    const selectedPaymentsData = paymentsWithQueries
                      .filter((p) => selectedPayments.has(p.id))
                      .map((p) => ({
                        payment_id: p.id,
                        query: p.localQuery || null,
                        total_approved_amount: p.total_approved_amount,
                        transactions: p.transactions,
                      }));

                    // Debug: Log the data being submitted
                    console.log("Submitting audit clearance with queries:", {
                      selectedPayments: selectedPaymentsData,
                      queriesCount: selectedPaymentsData.filter((p) => p.query)
                        .length,
                    });

                    // Pass to resolve function
                    resolve(
                      action.id,
                      existingDocument?.id || 0,
                      {
                        process_card_id: processCard.id,
                        document_draft_id: currentDraft?.id,
                        payments: selectedPaymentsData,
                        summary: null,
                      },
                      "store",
                      "processPaymentClearance"
                    );
                  }}
                  className="btn btn-success clearance-submit-btn"
                  disabled={!userCanHandle}
                >
                  <i className={action.icon || "ri-check-line"}></i>
                  {action.button_text || "Submit Audit"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditPaymentClear;
