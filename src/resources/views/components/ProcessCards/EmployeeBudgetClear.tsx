import React, { useMemo, useState } from "react";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { PaymentBatchResponseData } from "@/app/Repositories/PaymentBatch/data";
import { ExpenditureResponseData } from "@/app/Repositories/Expenditure/data";
import { toTitleCase } from "bootstrap/repositories";
import { PaymentResponseData } from "@/app/Repositories/Payment/data";
import PaymentRepository from "app/Repositories/Payment/PaymentRepository";
import Button from "../forms/Button";
import Alert from "app/Support/Alert";
import { ProcessGeneratorCardProps } from "../DocumentGeneratorTab/ProcessGeneratorTab";

const EmployeeBudgetClear: React.FC<ProcessGeneratorCardProps> = ({
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
  const [selectedExpenditures, setSelectedExpenditures] = useState<number[]>(
    []
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const { state } = usePaperBoard();
  const paymentRepo = new PaymentRepository();

  // Generate legendary unique payment code
  const generatePaymentCode = (
    expenditure: ExpenditureResponseData,
    batchCode: string,
    processCardService: string
  ): string => {
    // Timestamp (6 chars: HHMMSS)
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;

    // Unique hash from expenditure data (6 chars)
    const hashSource = `${expenditure.id}-${expenditure.code}-${batchCode}-${timestamp}`;
    const hash = Array.from(hashSource)
      .reduce((acc, char) => {
        return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
      }, 0)
      .toString(36)
      .toUpperCase()
      .slice(-6);

    // Format: PAY-{TIMESTAMP}-{HASH}
    // Total: 3 + 1 + 6 + 1 + 6 = 16 characters
    const paymentCode = `PAY-${timestamp}-${hash}`;

    return paymentCode;
  };

  const settle = (
    actionId: number,
    documentId: number,
    data: unknown,
    mode: "store" | "update" | "destroy"
  ) => {
    Alert.flash("Confirm", "info", "Commit Budget Clearance").then(
      async (result) => {
        if (result.isConfirmed) {
          resolve(actionId, documentId, data, mode);
        }
      }
    );
  };

  const payload: {
    batch: PaymentBatchResponseData;
    document: DocumentResponseData;
    payments: PaymentResponseData[];
  } | null = useMemo(() => {
    if (
      !resource ||
      !existingDocument ||
      !userCanHandle ||
      !userHasPermission ||
      !currentDraft
    )
      return null;

    const batch = resource as PaymentBatchResponseData;

    // Build payment payload from batch.expenditures using processCard.rules
    const payments: PaymentResponseData[] = batch.expenditures.map(
      (expenditure) => {
        // Determine chart of account based on transaction type from rules
        const chartOfAccountId =
          processCard.rules?.transaction === "debit"
            ? processCard.rules?.default_debit_account_id ?? 0
            : processCard.rules?.default_credit_account_id ?? 0;

        return {
          id: 0,
          code: generatePaymentCode(
            expenditure,
            batch?.code ?? "",
            processCard.service ?? ""
          ),
          expenditure_id: expenditure.id,
          payment_batch_id: batch.id,
          document_draft_id: currentDraft.id,
          department_id: batch.department_id,
          ledger_id: processCard.ledger_id ?? 0,
          chart_of_account_id: chartOfAccountId,
          user_id: batch.user_id,
          workflow_id: existingDocument.workflow_id ?? 0,
          document_category_id: existingDocument.document_category_id ?? 0,
          document_type_id: existingDocument.document_type_id ?? 0,
          process_card_id: processCard.id,
          resource_id: expenditure.linked_document?.resource_id ?? 0,
          resource_type: expenditure.linked_document?.resource_type ?? "",
          process_metadata: {
            stage_order: currentProcess.order,
            stage_name: currentProcess.stage?.name,
            expenditure_code: expenditure.code,
          },
          beneficiary: expenditure.linked_document?.published_by?.name ?? "",
          transaction_type: processCard.rules?.transaction ?? "debit",
          transaction_date: new Date().toISOString().split("T")[0],
          total_amount_payable: expenditure.amount,
          total_approved_amount: parseFloat(expenditure.amount),
          total_amount_paid: 0,
          total_taxable_amount: expenditure.vat_amount ?? 0,
          payable_id: expenditure.id,
          payable_type: "Expenditure",
          payment_method: "bank-transfer",
          type: expenditure.expense_type,
          currency: processCard.rules?.currency ?? "NGN",
          period: new Date().toISOString().split("T")[0],
          budget_year: expenditure.budget_year ?? new Date().getFullYear(),
          auto_generated: processCard.rules?.generate_transactions ?? false,
          requires_settlement:
            processCard.rules?.settle ||
            processCard.rules?.settle_after_approval ||
            false,
          is_settled: false,
          narration: `Payment for ${
            expenditure.purpose || "budget clearance"
          } - with transaction code {${expenditure.code}}`,
        };
      }
    );

    return {
      batch,
      document: existingDocument,
      payments,
    };
  }, [resource, existingDocument, processCard, currentProcess, currentDraft]);

  const expenditures: ExpenditureResponseData[] = useMemo(() => {
    return (payload?.batch?.expenditures as ExpenditureResponseData[]) || [];
  }, [payload]);

  // Get selected payments based on selected expenditures
  const selectedPayments = useMemo(() => {
    if (!payload?.payments) return [];
    return payload.payments.filter((payment) =>
      selectedExpenditures.includes(payment.expenditure_id)
    );
  }, [payload, selectedExpenditures]);

  // Toggle individual expenditure selection
  const toggleExpenditure = (id: number) => {
    setSelectedExpenditures((prev) =>
      prev.includes(id) ? prev.filter((expId) => expId !== id) : [...prev, id]
    );
  };

  console.log(selectedPayments);

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedExpenditures.length === expenditures.length) {
      setSelectedExpenditures([]);
    } else {
      setSelectedExpenditures(expenditures.map((exp) => exp.id));
    }
  };

  // Handle clearing selected expenditures
  const handleClearSelected = async () => {
    if (selectedPayments.length === 0) return;

    setIsProcessing(true);
    try {
      // Submit payments for selected expenditures
      const promises = selectedPayments.map((payment) =>
        paymentRepo.store("payments", payment)
      );

      const results = await Promise.all(promises);

      // Show success notification
      console.log(
        `Successfully created ${results.length} payment(s) for budget clearance`
      );

      // Clear selections
      setSelectedExpenditures([]);

      // Optionally refresh the data or move to next stage
      // You might want to call a callback here to refresh parent data
    } catch (error) {
      console.error("Error creating payments:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get initials from name
  const getInitials = (name: string): string => {
    const parts = name.split(",").map((s) => s.trim());
    if (parts.length >= 2) {
      const surname = parts[0];
      const firstname = parts[1];
      return `${surname.charAt(0)}${firstname.charAt(0)}`.toUpperCase();
    }
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format currency
  const formatCurrency = (
    amount: string | number,
    currency: string
  ): string => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  // Custom checkbox styles
  const checkboxStyles = {
    position: "relative" as const,
    width: "20px",
    height: "20px",
    appearance: "none" as const,
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#d1d5db",
    borderRadius: "6px",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
    flexShrink: 0,
  };

  const checkboxCheckedStyles = {
    ...checkboxStyles,
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
    boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)",
  };

  //   console.log(selectedPayments);

  return (
    <div className="employee-budget-clear-card">
      {/* Header Section */}
      <div
        className="card mb-3 border-0"
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          borderRadius: "12px",
        }}
      >
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h6 className="mb-1 fw-normal" style={{ fontSize: "1rem" }}>
                <i className="ri-money-dollar-circle-line me-2 text-success"></i>
                {processCard.name}
              </h6>
              <small className="text-muted" style={{ fontSize: "0.85rem" }}>
                Stage {currentProcess.order}: {currentProcess.stage?.name}
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              {selectedExpenditures.length > 0 && (
                <button
                  className="btn btn-sm btn-success border-0"
                  style={{
                    borderRadius: "8px",
                    padding: "6px 16px",
                    fontSize: "0.85rem",
                  }}
                  onClick={handleClearSelected}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="ri-check-double-line me-1"></i>
                      Clear {selectedExpenditures.length}
                    </>
                  )}
                </button>
              )}
              <span
                className="badge bg-light text-dark px-3 py-2"
                style={{
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: "500",
                }}
              >
                {expenditures.length} total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ProcessCard Information */}
      <div
        className="card mb-3 border-0"
        style={{
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          borderRadius: "10px",
          backgroundColor: "#f0fdf4",
        }}
      >
        <div className="card-body p-3">
          <div className="d-flex align-items-start gap-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "rgba(34, 197, 94, 0.15)",
              }}
            >
              <i
                className="ri-information-line text-success"
                style={{ fontSize: "1.2rem" }}
              ></i>
            </div>
            <div className="flex-grow-1">
              <h6
                className="mb-2"
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                Process Information
              </h6>
              <p
                className="mb-2 text-muted"
                style={{
                  fontSize: "0.85rem",
                  lineHeight: "1.5",
                }}
              >
                Review and select expenditures to clear for budget processing.
                {processCard.rules?.requires_approval &&
                  " This process requires approval before completion."}
              </p>
              <div className="d-flex flex-wrap gap-3 mt-2">
                {processCard.rules?.currency && (
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <i
                      className="ri-money-dollar-circle-line"
                      style={{ color: "#22c55e" }}
                    ></i>
                    <span className="text-muted">
                      Currency: <strong>{processCard.rules.currency}</strong>
                    </span>
                  </div>
                )}
                {processCard.rules?.transaction && (
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <i
                      className="ri-exchange-line"
                      style={{ color: "#22c55e" }}
                    ></i>
                    <span className="text-muted">
                      Type:{" "}
                      <strong className="text-capitalize">
                        {processCard.rules.transaction}
                      </strong>
                    </span>
                  </div>
                )}
                {processCard.service && (
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <i
                      className="ri-service-line"
                      style={{ color: "#22c55e" }}
                    ></i>
                    <span className="text-muted">
                      Service:{" "}
                      <strong>{toTitleCase(processCard.service)}</strong>
                    </span>
                  </div>
                )}
                {processCard.rules?.generate_transactions && (
                  <div
                    className="d-flex align-items-center gap-2"
                    style={{ fontSize: "0.8rem" }}
                  >
                    <i
                      className="ri-arrow-left-right-line"
                      style={{ color: "#22c55e" }}
                    ></i>
                    <span className="text-muted">
                      <strong>Auto-generates transactions</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expenditures List */}
      <div className="expenditures-list">
        {expenditures.length === 0 ? (
          <div
            className="card border-0"
            style={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              borderRadius: "12px",
            }}
          >
            <div className="card-body text-center py-5">
              <i
                className="ri-inbox-line mb-2"
                style={{ fontSize: "2.5rem", color: "#cbd5e1" }}
              ></i>
              <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                No expenditures found in this batch
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Select All Bar */}
            <div
              className="card mb-3 border-0"
              style={{
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                borderRadius: "10px",
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="position-relative">
                    <input
                      type="checkbox"
                      id="selectAll"
                      checked={
                        selectedExpenditures.length === expenditures.length &&
                        expenditures.length > 0
                      }
                      onChange={toggleSelectAll}
                      style={
                        selectedExpenditures.length === expenditures.length &&
                        expenditures.length > 0
                          ? checkboxCheckedStyles
                          : checkboxStyles
                      }
                    />
                    {selectedExpenditures.length === expenditures.length &&
                      expenditures.length > 0 && (
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
                  <label
                    htmlFor="selectAll"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "400",
                      color: "#6b7280",
                      cursor: "pointer",
                      marginBottom: 0,
                    }}
                  >
                    {selectedExpenditures.length === expenditures.length &&
                    expenditures.length > 0
                      ? "Deselect all"
                      : "Select all"}{" "}
                    <span style={{ opacity: 0.7 }}>
                      ({selectedExpenditures.length}/{expenditures.length})
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Expenditure Cards */}
            <div className="d-flex flex-column gap-3">
              {expenditures.map((expenditure) => {
                const isSelected = selectedExpenditures.includes(
                  expenditure.id
                );
                return (
                  <div
                    key={expenditure.id}
                    className="card border-0"
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      backgroundColor: isSelected
                        ? "rgba(34, 197, 94, 0.04)"
                        : "white",
                      boxShadow: isSelected
                        ? "0 2px 12px rgba(34, 197, 94, 0.15), 0 0 0 1px rgba(34, 197, 94, 0.2)"
                        : "0 2px 8px rgba(0,0,0,0.06)",
                      borderRadius: "12px",
                      transform: isSelected ? "translateY(-1px)" : "none",
                    }}
                    onClick={() => toggleExpenditure(expenditure.id)}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start gap-3">
                        {/* Checkbox */}
                        <div
                          className="position-relative"
                          style={{ marginTop: "2px" }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleExpenditure(expenditure.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={
                              isSelected
                                ? checkboxCheckedStyles
                                : checkboxStyles
                            }
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

                        {/* Avatar */}
                        {expenditure.linked_document?.published_by && (
                          <div
                            className="d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "12px",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              background:
                                "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                              color: "white",
                              boxShadow: "0 2px 8px rgba(34, 197, 94, 0.25)",
                            }}
                          >
                            {getInitials(
                              expenditure.linked_document.published_by.name
                            )}
                          </div>
                        )}

                        {/* Main Content */}
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                            <div className="flex-grow-1">
                              {expenditure.linked_document && (
                                <div>
                                  <h6
                                    className="mb-1"
                                    style={{
                                      fontSize: "0.95rem",
                                      fontWeight: "600",
                                      color: "#1f2937",
                                    }}
                                  >
                                    {expenditure.linked_document.title}
                                  </h6>
                                  {expenditure.linked_document.published_by && (
                                    <div
                                      className="text-muted"
                                      style={{ fontSize: "0.85rem" }}
                                    >
                                      {
                                        expenditure.linked_document.published_by
                                          .name
                                      }{" "}
                                      <span
                                        style={{
                                          opacity: 0.5,
                                          margin: "0 4px",
                                        }}
                                      >
                                        •
                                      </span>{" "}
                                      {
                                        expenditure.linked_document.published_by
                                          .department
                                      }
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-end">
                              <div
                                className="text-dark mb-1"
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: "600",
                                }}
                              >
                                {formatCurrency(
                                  expenditure.amount,
                                  expenditure.currency
                                )}
                              </div>
                              <span
                                className={`badge ${
                                  expenditure.status === "approved"
                                    ? "bg-success"
                                    : expenditure.status === "pending"
                                    ? "bg-warning"
                                    : "bg-secondary"
                                }`}
                                style={{
                                  borderRadius: "6px",
                                  padding: "4px 10px",
                                  fontSize: "0.75rem",
                                  fontWeight: "500",
                                }}
                              >
                                {expenditure.status}
                              </span>
                            </div>
                          </div>

                          {/* Footer Info */}
                          <div
                            className="d-flex align-items-center flex-wrap gap-3 text-muted"
                            style={{ fontSize: "0.8rem" }}
                          >
                            <span
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <i
                                className="ri-user-line me-1"
                                style={{ fontSize: "0.9rem" }}
                              ></i>
                              {expenditure.expense_type === "staff"
                                ? "Staff"
                                : "Third Party"}
                            </span>
                            {expenditure.linked_document?.ref && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <i
                                  className="ri-file-text-line me-1"
                                  style={{ fontSize: "0.9rem" }}
                                ></i>
                                {expenditure.linked_document.ref}
                              </span>
                            )}
                            {expenditure.linked_document?.published_by
                              ?.staff_no && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <i
                                  className="ri-hashtag me-1"
                                  style={{ fontSize: "0.9rem" }}
                                ></i>
                                {
                                  expenditure.linked_document.published_by
                                    .staff_no
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/*
             * Data List
             * - document_action_id: number
             * - data: unknown
             * - mode: "store" | "update" | "destroy"
             * - document_id: number
             * - document_draft_id: number
             * - service: string
             * - method: string
             * - type: "staff" | "third-party"
             * - period: string
             * - rules: ProcessCardRulesProps
             * - message: string
             * - progress_tracker_id: number
             */}
            <div className="actions__area mt-4">
              {allowedActions.map((action) => {
                return (
                  <Button
                    key={action.id}
                    variant={"success"}
                    label={action.button_text}
                    handleClick={() =>
                      settle(
                        action.id,
                        existingDocument?.id || 0,
                        selectedPayments,
                        "store"
                      )
                    }
                    icon={action.icon}
                    size="sm"
                    isDisabled={selectedPayments.length < 1}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeBudgetClear;
