import { usePaperBoard } from "app/Context/PaperBoardContext";
import {
  BaseRepository,
  JsonResponse,
} from "@/app/Repositories/BaseRepository";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useResourceContext } from "app/Context/ResourceContext";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import CustomSelect, { CustomSelectOption } from "../forms/CustomSelect";
import moment from "moment";
import { repo, extractModelName } from "bootstrap/repositories";
import { useStateContext } from "app/Context/ContentContext";
import Button from "../forms/Button";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { SheetProps } from "resources/views/pages/DocumentTemplateContent";
import { InvoiceContentWithTotals } from "../ContentCards/InvoiceContent.types";
import { ProjectResponseData } from "@/app/Repositories/Project/data";

interface WorkorderResourceCardProps {
  category: DocumentCategoryResponseData;
  repository: BaseRepository;
}

const sanitizeClassName = (value: string | undefined): string => {
  if (!value) return "neutral";
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const parsed = moment(value);
  if (!parsed.isValid()) return "—";
  return parsed.format("DD MMM YYYY");
};

const isDocumentResponse = (value: unknown): value is DocumentResponseData => {
  if (!value || typeof value !== "object") return false;
  return "id" in value && "title" in value && "status" in value;
};

interface ValidationCheck {
  id: string;
  message: string;
  status: "success" | "error" | "warning";
  icon: string;
}

interface ValidationResult {
  isValid: boolean;
  checks: ValidationCheck[];
}

const WorkorderResourceCard: React.FC<WorkorderResourceCardProps> = ({
  category,
  repository,
}) => {
  const documentRepo = repo("document");
  const { config } = useStateContext();
  const { state, actions } = usePaperBoard();
  const { getResource, getResourceById } = useResourceContext();
  const [documents, setDocuments] = useState<DocumentResponseData[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<
    string | number | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>(
    []
  );
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [timelineHeight, setTimelineHeight] = useState(0);
  const [workOrderGenerated, setWorkOrderGenerated] = useState(false);
  const checksContainerRef = useRef<HTMLDivElement>(null);

  const thresholds = getResource("thresholds");
  const budgetYear = useMemo(() => config("jolt_budget_year"), [config]);

  const parseDocuments = useCallback(
    (payload: unknown): DocumentResponseData[] => {
      if (!repository || !payload) return [];

      const parseEntry = (entry: JsonResponse): DocumentResponseData => {
        return repository.fromJson(entry) as DocumentResponseData;
      };

      if (Array.isArray(payload)) {
        return payload
          .filter((item): item is JsonResponse => !!item)
          .map(parseEntry);
      }

      if (typeof payload === "object" && payload !== null) {
        const dataField = (payload as Record<string, unknown>).data;
        if (Array.isArray(dataField)) {
          return dataField
            .filter((item): item is JsonResponse => !!item)
            .map(parseEntry);
        }

        return [parseEntry(payload as JsonResponse)];
      }

      return [];
    },
    [repository]
  );

  const fetchDocumentsAwaitingProcurement = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Don't specify scopes - repository will use user's effective scope automatically
      // This is the safest approach and respects the user's rank and permissions
      const response = await documentRepo.store("query", {
        service: "document",
        conditions: [{ column: "status", operator: "=", value: "procurement" }],
        // No scopes specified - repository applies effective scope based on user's rank
        // No bypass_department_filter - repository handles access control properly
        paginate: false,
      });

      if (response.status === "success") {
        // const parsed = parseDocuments(response.data);
        setDocuments(response.data as DocumentResponseData[]);
      } else {
        setDocuments([]);
        setError(response.message || "We could not fetch documents right now.");
      }
    } catch (err) {
      setDocuments([]);
      setError("Something went wrong while retrieving documents.");
    } finally {
      setIsLoading(false);
    }
  }, [repository, parseDocuments]);

  useEffect(() => {
    fetchDocumentsAwaitingProcurement();
  }, [fetchDocumentsAwaitingProcurement]);

  // Update timeline height whenever validation checks change
  useEffect(() => {
    if (checksContainerRef.current && validationChecks.length > 0) {
      const updateHeight = () => {
        if (checksContainerRef.current) {
          const actualHeight = checksContainerRef.current.scrollHeight;
          setTimelineHeight(actualHeight);
        }
      };

      // Small delay to ensure DOM has updated
      const timeoutId = setTimeout(updateHeight, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [validationChecks]);

  // Convert documents to CustomSelectOption format
  const selectOptions: CustomSelectOption[] = useMemo(() => {
    return documents.map((doc) => {
      const statusLabel = doc.status?.replace(/[_-]/g, " ") ?? "Unknown";
      const statusClass = sanitizeClassName(doc.status);

      // Determine status variant based on status
      let statusVariant: "success" | "warning" | "error" | "info" | "neutral" =
        "neutral";
      if (doc.status === "procurement" || doc.status === "processing") {
        statusVariant = "info";
      } else if (doc.status === "approved" || doc.status === "completed") {
        statusVariant = "success";
      } else if (doc.status === "pending" || doc.status === "draft") {
        statusVariant = "warning";
      } else if (doc.status === "rejected" || doc.status === "cancelled") {
        statusVariant = "error";
      }

      // Get user name from owner or use fallback
      const userName = doc.owner?.name || doc.owner?.staff_no || "Unknown";

      // Get document type name
      const docType =
        doc.document_type?.name || doc.document_type?.label || "Document";

      return {
        value: doc.id,
        title: doc.title,
        avatar: {
          type: "icon",
          content: "ri-file-text-line",
        },
        type: docType,
        status: {
          label: statusLabel,
          variant: statusVariant,
        },
        user: userName,
        date: formatDate(doc.created_at),
      };
    });
  }, [documents]);

  const validateDocument = useCallback(
    async (document: DocumentResponseData): Promise<ValidationResult> => {
      const checks: ValidationCheck[] = [];
      let isValid = true;

      // Check 1: Documentable Type (Project or Event)
      const service = extractModelName(document.documentable_type || "");
      const isServiceValid = service === "Project" || service === "Event";
      checks.push({
        id: "service-check",
        message: isServiceValid
          ? `${service} verified`
          : "Service must either be a Project or an Event",
        status: isServiceValid ? "success" : "error",
        icon: isServiceValid
          ? "ri-checkbox-circle-line"
          : "ri-error-warning-line",
      });
      if (!isServiceValid) isValid = false;

      // Check 2: Fund ID
      const hasFundId = (document.fund_id ?? 0) > 0;
      checks.push({
        id: "fund-check",
        message: hasFundId
          ? "Budget Head identified"
          : "The Budget Head is required in order to proceed with this process",
        status: hasFundId ? "success" : "error",
        icon: hasFundId ? "ri-checkbox-circle-line" : "ri-error-warning-line",
      });
      if (!hasFundId) isValid = false;

      // Check 3: Action Status
      const actionStatus = document.action?.action_status;
      const isActionComplete = actionStatus === "complete";
      checks.push({
        id: "action-check",
        message: isActionComplete
          ? "Document Processing Permission Granted"
          : "It is not yet time to process this document",
        status: isActionComplete ? "success" : "warning",
        icon: isActionComplete ? "ri-checkbox-circle-line" : "ri-time-line",
      });
      // Warning doesn't invalidate - only errors do

      // Check 4: Approved Amount and VAT Amount
      const approvedAmount = parseFloat(String(document.approved_amount ?? 0));
      const vatAmount = parseFloat(String(document.vat_amount ?? 0));
      const hasValidAmounts = approvedAmount > 0 && vatAmount > 0;
      checks.push({
        id: "amount-check",
        message: hasValidAmounts
          ? "Financial amounts verified"
          : "Approved amount and VAT amount must be greater than 0",
        status: hasValidAmounts ? "success" : "error",
        icon: hasValidAmounts
          ? "ri-checkbox-circle-line"
          : "ri-error-warning-line",
      });
      if (!hasValidAmounts) isValid = false;

      // Check 5: Budget Year
      const docBudgetYear = document.budget_year ?? 0;
      const budgetYearMatch = docBudgetYear === budgetYear;
      checks.push({
        id: "budget-year-check",
        message: budgetYearMatch
          ? "Document Budget Period Confirmed"
          : "Mismatch budget year",
        status: budgetYearMatch ? "success" : "error",
        icon: budgetYearMatch
          ? "ri-checkbox-circle-line"
          : "ri-error-warning-line",
      });
      if (!budgetYearMatch) isValid = false;

      // Check 6: Payments (must be empty)
      const hasNoPayments =
        !document.payments || document.payments.length === 0;
      checks.push({
        id: "payments-check",
        message: hasNoPayments
          ? "No existing payments detected - ready for processing"
          : `This document already has ${
              document.payments?.length || 0
            } payment(s) recorded. Please review before proceeding.`,
        status: hasNoPayments ? "success" : "warning",
        icon: hasNoPayments ? "ri-checkbox-circle-line" : "ri-information-line",
      });
      // Warning doesn't invalidate - only errors do

      // Check 7: Invoice Detection in Contents
      const contents = document.contents || [];
      let invoiceDetected = false;
      let invoiceServiceType = "";

      for (const content of contents) {
        const invoice = content.content?.invoice;

        if (
          invoice &&
          typeof invoice === "object" &&
          "rows" in invoice &&
          "headers" in invoice &&
          "settings" in invoice &&
          "totals" in invoice
        ) {
          invoiceDetected = true;
          invoiceServiceType = service;
          break;
        }
      }

      checks.push({
        id: "invoice-check",
        message: invoiceDetected
          ? `${invoiceServiceType} invoice detected`
          : "No Invoice Detected",
        status: invoiceDetected ? "success" : "warning",
        icon: invoiceDetected ? "ri-file-list-3-line" : "ri-file-line",
      });

      return { isValid, checks };
    },
    [budgetYear]
  );

  const runValidationChecks = useCallback(
    async (document: DocumentResponseData) => {
      setIsValidating(true);
      setValidationChecks([]);
      setValidationResult(null);
      setTimelineHeight(0);

      const result = await validateDocument(document);

      // Display checks one by one with delay and update timeline
      for (let i = 0; i < result.checks.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 400)); // 400ms delay between checks for smoother flow
        setValidationChecks((prev) => [...prev, result.checks[i]]);

        // Update timeline height based on actual rendered content
        setTimeout(() => {
          if (checksContainerRef.current) {
            const actualHeight = checksContainerRef.current.scrollHeight;
            setTimelineHeight(actualHeight);
          }
        }, 50); // Small delay to allow DOM to update
      }

      // Set final result after all checks are displayed
      setTimeout(() => {
        setValidationResult(result);
        setIsValidating(false);
        // Final height update to ensure accuracy
        if (checksContainerRef.current) {
          const actualHeight = checksContainerRef.current.scrollHeight;
          setTimelineHeight(actualHeight);
        }
      }, 300);
    },
    [validateDocument]
  );

  const handleDocumentChange = useCallback(
    (value: string | number | (string | number)[] | null) => {
      const docId = value as string | number | null;
      setSelectedDocument(docId);
      setValidationChecks([]);
      setValidationResult(null);
      setWorkOrderGenerated(false); // Reset when document changes

      if (docId !== null) {
        const selectedDoc = documents.find((doc) => doc.id === docId);
        if (selectedDoc && isDocumentResponse(selectedDoc)) {
          actions.setResource(selectedDoc);
          actions.setMode("update");
          // Run validation checks
          runValidationChecks(selectedDoc);
        }
      }
    },
    [documents, actions, runValidationChecks]
  );

  // Restore selectedDocument from global state when component mounts or resource changes
  useEffect(() => {
    if (state.resource && isDocumentResponse(state.resource)) {
      const resourceDoc = state.resource as DocumentResponseData;
      // Only set if it's a document with status "procurement" and not already selected
      if (
        resourceDoc.status === "procurement" &&
        resourceDoc.id !== selectedDocument &&
        documents.length > 0
      ) {
        setSelectedDocument(resourceDoc.id);
        // Run validation if document is valid
        runValidationChecks(resourceDoc);
      }
    }
  }, [state.resource, selectedDocument, documents, runValidationChecks]);

  const handleGenerateWorkOrder = useCallback(() => {
    if (!selectedDocument) return;

    const selectedDoc = documents.find((doc) => doc.id === selectedDocument);
    if (!selectedDoc || !validationResult?.isValid) return;

    // Find invoice content in document.contents
    const contents = selectedDoc.contents || [];
    let invoiceContent: InvoiceContentWithTotals | null = null;

    for (const content of contents) {
      if (content.type === "invoice") {
        const invoice = content.content?.invoice;
        if (
          invoice &&
          typeof invoice === "object" &&
          "rows" in invoice &&
          "headers" in invoice &&
          "settings" in invoice &&
          "totals" in invoice
        ) {
          invoiceContent = invoice as InvoiceContentWithTotals;
          break;
        }
      }
    }

    // Build updated body with both invoice and paper_title updates
    let updatedBody = [...state.body];

    // Update or add invoice content if found
    if (invoiceContent) {
      const existingInvoiceIndex = updatedBody.findIndex(
        (block) => block.type === "invoice"
      );

      const invoiceBlock: ContentBlock = {
        id:
          existingInvoiceIndex >= 0
            ? updatedBody[existingInvoiceIndex].id
            : crypto.randomUUID(),
        type: "invoice",
        block:
          existingInvoiceIndex >= 0
            ? updatedBody[existingInvoiceIndex].block
            : ({} as any),
        order:
          existingInvoiceIndex >= 0
            ? updatedBody[existingInvoiceIndex].order
            : updatedBody.length,
        content: {
          id:
            existingInvoiceIndex >= 0
              ? updatedBody[existingInvoiceIndex].id
              : crypto.randomUUID(),
          order:
            existingInvoiceIndex >= 0
              ? updatedBody[existingInvoiceIndex].order
              : updatedBody.length,
          invoice: invoiceContent,
        } as SheetProps,
      };

      if (existingInvoiceIndex >= 0) {
        updatedBody = updatedBody.map((block, index) =>
          index === existingInvoiceIndex ? invoiceBlock : block
        );
      } else {
        updatedBody.push(invoiceBlock);
      }
    }

    // Update or add paper_title with "Work Order for {Project Title}"
    const documentable = selectedDoc.documentable as
      | ProjectResponseData
      | undefined;
    if (documentable && documentable.title) {
      const projectTitle = documentable.title;
      const workOrderTitle = `Work Order for ${projectTitle}`;

      const existingPaperTitleIndex = updatedBody.findIndex(
        (block) => block.type === "paper_title"
      );

      const paperTitleBlock: ContentBlock = {
        id:
          existingPaperTitleIndex >= 0
            ? updatedBody[existingPaperTitleIndex].id
            : crypto.randomUUID(),
        type: "paper_title",
        block:
          existingPaperTitleIndex >= 0
            ? updatedBody[existingPaperTitleIndex].block
            : ({} as any),
        order:
          existingPaperTitleIndex >= 0
            ? updatedBody[existingPaperTitleIndex].order
            : 0,
        content: {
          id:
            existingPaperTitleIndex >= 0
              ? updatedBody[existingPaperTitleIndex].id
              : crypto.randomUUID(),
          order:
            existingPaperTitleIndex >= 0
              ? updatedBody[existingPaperTitleIndex].order
              : 0,
          paper_title: {
            title: workOrderTitle,
            tagline:
              existingPaperTitleIndex >= 0
                ? (
                    updatedBody[existingPaperTitleIndex].content
                      ?.paper_title as any
                  )?.tagline || "Purpose"
                : "Purpose",
          },
        } as SheetProps,
      };

      if (existingPaperTitleIndex >= 0) {
        updatedBody = updatedBody.map((block, index) =>
          index === existingPaperTitleIndex ? paperTitleBlock : block
        );
      } else {
        updatedBody = [paperTitleBlock, ...updatedBody];
      }
    }

    // Single state update with all changes
    actions.setBody(updatedBody);
    // Mark work order as generated
    setWorkOrderGenerated(true);
  }, [selectedDocument, documents, validationResult, state.body, actions]);

  //   console.log(documents);

  return (
    <div className="workorder-resource">
      <div className="workorder-resource__header">
        <h5>Link a Document</h5>
        <p>
          Search and attach a document awaiting procurement to this workorder.
        </p>
      </div>

      {isLoading && (
        <div className="workorder-resource__loading">
          <i className="ri-loader-4-line" />
          <p>Fetching documents...</p>
        </div>
      )}

      {error && (
        <div className="workorder-resource__error">
          <i className="ri-error-warning-line" />
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <CustomSelect
          label="Select Document"
          options={selectOptions}
          value={selectedDocument}
          onChange={handleDocumentChange}
          placeholder="Click to search documents..."
          isSearchable
          isDisabled={isLoading}
        />
      )}

      {selectedDocument && (
        <div className="workorder-resource__selected">
          <div className="workorder-resource__validation">
            <div className="workorder-resource__validation-header">
              <h6>
                <i className="ri-shield-check-line" />
                Document Validation
              </h6>
              {isValidating && (
                <div className="workorder-resource__validation-loading">
                  <i className="ri-loader-4-line" />
                  <span>Validating...</span>
                </div>
              )}
              {validationResult && !isValidating && (
                <div
                  className={`workorder-resource__validation-summary ${
                    validationResult.isValid ? "valid" : "invalid"
                  }`}
                >
                  <i
                    className={
                      validationResult.isValid
                        ? "ri-checkbox-circle-fill"
                        : "ri-error-warning-fill"
                    }
                  />
                  <span>
                    {validationResult.isValid
                      ? "All checks passed"
                      : "Some checks failed"}
                  </span>
                </div>
              )}
            </div>

            <div
              ref={checksContainerRef}
              className="workorder-resource__validation-checks"
              style={{
                ["--timeline-height" as string]: `${timelineHeight}px`,
              }}
            >
              {validationChecks.map((check, index) => (
                <div
                  key={check.id}
                  className={`workorder-resource__validation-check workorder-resource__validation-check--${check.status}`}
                  style={{
                    animationDelay: `${index * 0.4}s`,
                  }}
                >
                  <div className="workorder-resource__validation-check-icon">
                    <i className={check.icon} />
                  </div>
                  <div className="workorder-resource__validation-check-message">
                    {check.message}
                  </div>
                </div>
              ))}
            </div>

            {validationResult && !isValidating && (
              <div className="workorder-resource__validation-actions">
                {validationResult.isValid ? (
                  <Button
                    label="Generate Work Order for Document"
                    variant="success"
                    size="md"
                    icon="ri-file-add-line"
                    handleClick={handleGenerateWorkOrder}
                    fullWidth
                    isDisabled={workOrderGenerated}
                  />
                ) : (
                  <Button
                    label="Nudge Budget Controller to Attend"
                    variant="danger"
                    size="md"
                    icon="ri-notification-line"
                    fullWidth
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkorderResourceCard;
