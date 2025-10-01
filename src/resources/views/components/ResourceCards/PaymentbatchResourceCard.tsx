import React, { useEffect, useState } from "react";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { extractModelName, toTitleCase } from "bootstrap/repositories";
import {
  PaymentBatchContentProps,
  PaymentBatchContentDocumentProps,
} from "../ContentCards/PaymentBatchContentCard";
import { getContentBlockByType } from "../../../../app/Utils/ContentBlockUtils";

interface PaymentbatchResourceCardProps {
  category: DocumentCategoryResponseData;
  repository: BaseRepository;
  responseData: unknown;
}

const PaymentbatchResourceCard: React.FC<PaymentbatchResourceCardProps> = ({
  category,
  repository,
  responseData,
}) => {
  const { state, actions } = usePaperBoard();

  const [queued, setQueued] = useState<DocumentResponseData[]>([]);
  const [totalQueuedAmount, setTotalQueuedAmount] = useState(0);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (repository) {
      const fetchDraftsInBatchQueue = async () => {
        const response = await repository.collection(
          "collated/queued/documents"
        );

        if (response.code === 200 && response.data) {
          const queued = response.data as DocumentResponseData[];
          const categoried =
            queued.filter((item) => item.type === category?.type) ?? [];

          setQueued(categoried);
          setTotalQueuedAmount(
            categoried.reduce(
              (acc, curr) => acc + (Number(curr?.approved_amount) ?? 0),
              0
            )
          );

          // Trigger animation for visible cards
          categoried.forEach((_, index) => {
            setTimeout(() => {
              setVisibleCards((prev) => new Set([...prev, index]));
            }, index * 100);
          });
        }
      };

      fetchDraftsInBatchQueue();
    }
  }, [repository, category?.type]);

  // Get current payment batch content from global state
  const getPaymentBatchContent = (): PaymentBatchContentProps | null => {
    const contentBlock = getContentBlockByType(state.body, "payment_batch");
    return (
      (contentBlock?.content?.payment_batch as PaymentBatchContentProps) || null
    );
  };

  // Get selected documents from global state
  const getSelectedDocuments = (): PaymentBatchContentDocumentProps[] => {
    const paymentBatchContent = getPaymentBatchContent();
    return paymentBatchContent?.documents || [];
  };

  // Get max allowed documents based on category type
  const getMaxAllowedDocuments = (): number => {
    if (category?.type === "staff") return 6;
    if (category?.type === "third-party") return 1;
    return queued.length; // No limit for other types
  };

  // Generate document with UUID identifier
  const generateDocumentWithIdentifier = (
    document: DocumentResponseData
  ): PaymentBatchContentDocumentProps => {
    // Generate unique identifier with timestamp and mixed characters
    const generateUniqueIdentifier = (): string => {
      const timestamp = Date.now().toString();
      const uuid = crypto.randomUUID().replace(/-/g, "");

      // Mix timestamp and UUID characters for enhanced uniqueness
      const mixed = [];
      const maxLength = Math.max(timestamp.length, uuid.length);

      for (let i = 0; i < maxLength; i++) {
        if (i < timestamp.length) {
          mixed.push(timestamp[i]);
        }
        if (i < uuid.length) {
          mixed.push(uuid[i]);
        }
      }

      return mixed.join("");
    };

    return {
      ...document,
      identifier: generateUniqueIdentifier(), // Generate unique identifier with timestamp
    };
  };

  // Update payment batch content in global state
  const updatePaymentBatchContent = (
    selectedDocuments: DocumentResponseData[]
  ) => {
    const contentBlock = state.body.find(
      (body) =>
        body.type === "payment_batch" ||
        body.block?.data_type === "payment_batch"
    );

    if (!contentBlock) return;

    // Calculate auto-generated fields
    const no_of_payments = selectedDocuments.length;
    const total_amount = selectedDocuments.reduce(
      (sum, doc) => sum + (Number(doc.approved_amount) || 0),
      0
    );

    let purpose: string;
    if (selectedDocuments.length === 1) {
      purpose = selectedDocuments[0].title;
    } else {
      purpose = `Payment Batch for ${selectedDocuments.length} Documents`;
    }

    const updatedPaymentBatchContent: PaymentBatchContentProps = {
      purpose,
      no_of_payments,
      total_amount,
      documents: selectedDocuments.map(generateDocumentWithIdentifier), // Generate identifiers
    };

    // Update the content block
    const updatedContentBlock = {
      ...contentBlock,
      content: {
        ...contentBlock.content,
        payment_batch: updatedPaymentBatchContent,
      } as any, // Type assertion to handle the complex SheetProps structure
    };

    actions.updateBody(updatedContentBlock, "payment_batch");
  };

  const handleDocumentSelect = (
    document: DocumentResponseData,
    isSelected: boolean
  ) => {
    const currentSelected = getSelectedDocuments();
    const maxAllowed = getMaxAllowedDocuments();

    let newSelected: DocumentResponseData[];

    if (isSelected) {
      // Add document if not at max limit
      if (currentSelected.length < maxAllowed) {
        // Convert current selected back to DocumentResponseData format for processing
        const currentAsDocs = currentSelected.map((doc) => {
          const { identifier, ...docData } = doc;
          return docData;
        });
        newSelected = [...currentAsDocs, document];
      } else {
        // At max limit, ignore the selection
        return;
      }
    } else {
      // Remove document - convert back to DocumentResponseData format
      newSelected = currentSelected
        .filter((doc) => doc.id !== document.id)
        .map((doc) => {
          const { identifier, ...docData } = doc;
          return docData;
        });
    }

    updatePaymentBatchContent(newSelected);
  };

  const handleSelectAll = () => {
    const currentSelected = getSelectedDocuments();
    const maxAllowed = getMaxAllowedDocuments();

    let newSelected: DocumentResponseData[];

    if (currentSelected.length === Math.min(queued.length, maxAllowed)) {
      // Deselect all
      newSelected = [];
    } else {
      // Select up to max allowed
      newSelected = queued.slice(0, maxAllowed);
    }

    updatePaymentBatchContent(newSelected);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "processing":
        return "#3b82f6";
      case "completed":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  console.log(getSelectedDocuments());

  return (
    <div className="paymentbatch-resource-card">
      {/* Header Section */}
      <div className="paymentbatch-header">
        <div className="paymentbatch-title">
          <h3 className="paymentbatch-title-text">
            {category?.name || "Payment Batch Queue"}
          </h3>
          <p className="paymentbatch-subtitle">
            {queued.length} documents • Total:{" "}
            {formatCurrency(totalQueuedAmount)}
          </p>
        </div>

        {queued.length > 0 && (
          <div className="paymentbatch-actions">
            <button
              onClick={handleSelectAll}
              className="paymentbatch-select-all-btn"
            >
              {getSelectedDocuments().length ===
              Math.min(queued.length, getMaxAllowedDocuments())
                ? "Deselect All"
                : "Select All"}
            </button>
            {getSelectedDocuments().length > 0 && (
              <span className="paymentbatch-selected-count">
                {getSelectedDocuments().length} selected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="paymentbatch-documents-container">
        {queued.length === 0 ? (
          <div className="paymentbatch-empty-state">
            <div className="paymentbatch-empty-icon">📋</div>
            <h4>No documents in queue</h4>
            <p>
              Documents will appear here when they&apos;re ready for batch
              processing
            </p>
          </div>
        ) : (
          <div className="paymentbatch-documents-list">
            {queued.map((document, index) => (
              <div
                key={document.id}
                className={`paymentbatch-document-card ${
                  visibleCards.has(index) ? "paymentbatch-card-visible" : ""
                } ${
                  getSelectedDocuments().some((doc) => doc.id === document.id)
                    ? "paymentbatch-card-selected"
                    : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="paymentbatch-card-checkbox">
                  <input
                    type="checkbox"
                    id={`document-${document.id}`}
                    checked={getSelectedDocuments().some(
                      (doc) => doc.id === document.id
                    )}
                    onChange={(e) =>
                      handleDocumentSelect(document, e.target.checked)
                    }
                    className="paymentbatch-checkbox-input"
                  />
                  <label
                    htmlFor={`document-${document.id}`}
                    className="paymentbatch-checkbox-label"
                  >
                    <div className="paymentbatch-checkbox-custom"></div>
                  </label>
                </div>

                <div className="paymentbatch-card-content">
                  <div className="paymentbatch-card-header">
                    <h4 className="paymentbatch-document-title">
                      {document.title}
                    </h4>
                    <span
                      className="paymentbatch-status-badge"
                      style={{
                        backgroundColor: getStatusColor(document.status),
                      }}
                    >
                      {document.status}
                    </span>
                  </div>

                  <div className="paymentbatch-card-details">
                    <div className="paymentbatch-detail-row">
                      <span className="paymentbatch-detail-label">
                        Reference:
                      </span>
                      <span className="paymentbatch-detail-value">
                        {document.ref}
                      </span>
                    </div>

                    {document.owner && (
                      <div className="paymentbatch-detail-row">
                        <span className="paymentbatch-detail-label">
                          Owner:
                        </span>
                        <span className="paymentbatch-detail-value">
                          {document.owner.name}
                        </span>
                      </div>
                    )}

                    <div className="paymentbatch-detail-row">
                      <span className="paymentbatch-detail-label">
                        Department:
                      </span>
                      <span className="paymentbatch-detail-value">
                        {document.dept || "N/A"}
                      </span>
                    </div>

                    {document.documentable_type && (
                      <div className="paymentbatch-detail-row">
                        <span className="paymentbatch-detail-label">
                          Resource:
                        </span>
                        <span className="paymentbatch-detail-value">
                          {toTitleCase(
                            extractModelName(document.documentable_type)
                          )}
                        </span>
                      </div>
                    )}

                    {document.approved_amount && (
                      <div className="paymentbatch-detail-row paymentbatch-amount-row">
                        <span className="paymentbatch-detail-label">
                          Amount:
                        </span>
                        <span className="paymentbatch-amount-value">
                          {formatCurrency(Number(document.approved_amount))}
                        </span>
                      </div>
                    )}
                  </div>

                  {document.description && (
                    <div className="paymentbatch-card-description">
                      <p>{document.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Batch Actions */}
      {getSelectedDocuments().length > 0 && (
        <div className="paymentbatch-footer">
          <div className="paymentbatch-batch-summary">
            <span className="paymentbatch-batch-text">
              {getSelectedDocuments().length} documents selected
            </span>
            <span className="paymentbatch-batch-amount">
              Total:{" "}
              {formatCurrency(
                getSelectedDocuments().reduce(
                  (acc, curr) => acc + (Number(curr?.approved_amount) ?? 0),
                  0
                )
              )}
            </span>
          </div>
          <button className="paymentbatch-create-batch-btn">
            Create Batch
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentbatchResourceCard;
