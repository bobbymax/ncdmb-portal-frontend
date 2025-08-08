import React, { useState, useCallback } from "react";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { FundResponseData } from "@/app/Repositories/Fund/data";
import useDirectories from "app/Hooks/useDirectories";
import { repo } from "bootstrap/repositories";
import { formatOptions } from "app/Support/Helpers";
import { ActionMeta } from "react-select";
import { toast } from "react-toastify";
import TextInput from "resources/views/components/forms/TextInput";
import Button from "resources/views/components/forms/Button";
import MultiSelect from "resources/views/components/forms/MultiSelect";

interface DocumentSectionsProps {
  Repository: BaseRepository;
}

const DocumentSections: React.FC<DocumentSectionsProps> = ({ Repository }) => {
  const { state, actions } = useTemplateBoard();
  const [parentDocument, setParentDocument] = useState<string>("");
  const [isAttachingDocument, setIsAttachingDocument] = useState(false);
  const [fundObject, setFundObject] = useState<FundResponseData | null>(null);

  const { collection: funds } = useDirectories(repo("fund"), "funds");

  const handleFundChange = useCallback(
    (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
      const updatedValue = newValue as any;
      actions.setFund(updatedValue);
      setFundObject(
        funds.find((f) => f.id === updatedValue.value) as FundResponseData
      );
    },
    [actions, funds]
  );

  const fetchParentDocument = useCallback(async () => {
    if (!parentDocument || !Repository) {
      toast.error("Please enter a document reference");
      return;
    }

    if (parentDocument.trim() === "") {
      toast.error("Please enter a document reference");
      return;
    }

    setIsAttachingDocument(true);

    try {
      const encodedRef = encodeURIComponent(parentDocument);
      const response = await Repository.show("documents/ref", encodedRef);

      if (response && response.code === 200 && response.data) {
        actions.setParentDocument(response.data as DocumentResponseData);
        toast.success("Parent document attached successfully");
      } else if (response && response.status === "error") {
        toast.error(
          "Document not found. Please check the reference and try again."
        );
      } else {
        toast.error("Error fetching parent document. Please try again.");
      }
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          toast.error(
            "Network error. Please check your connection and try again."
          );
        } else {
          toast.error("Error fetching parent document. Please try again.");
        }
      } else {
        toast.error("Error fetching parent document. Please try again.");
      }
    } finally {
      setIsAttachingDocument(false);
    }
  }, [Repository, parentDocument, actions]);

  return (
    <div className="document__sections__container">
      <div className="row">
        {/* Parent Document Section */}
        <div className="col-md-12 mb-4">
          <div className="parent__document__section">
            <div className="mb-3">
              <TextInput
                label="Attach Parent Document"
                name="parent_document"
                value={parentDocument}
                onChange={(e) => setParentDocument(e.target.value)}
                placeholder="Enter Reference Number"
              />
              <Button
                label={isAttachingDocument ? "Attaching..." : "Attach"}
                handleClick={fetchParentDocument}
                icon={
                  isAttachingDocument
                    ? "ri-loader-4-line"
                    : "ri-attachment-line"
                }
                size="sm"
                variant="dark"
                isDisabled={!parentDocument || isAttachingDocument}
              />
            </div>

            <div className="reference__document__container">
              {state.parentDocument ? (
                <div className="reference__document__card">
                  <div className="reference__document__header">
                    <i className="ri-file-text-line"></i>
                    <span className="reference__document__title">
                      Parent Document
                    </span>
                  </div>
                  <div className="reference__document__content">
                    <div className="reference__document__ref">
                      <strong>Ref:</strong> {state.parentDocument.ref}
                    </div>
                    <div className="reference__document__title_text">
                      <strong>Title:</strong> {state.parentDocument.title}
                    </div>
                    <div className="reference__document__description">
                      <strong>Description:</strong>{" "}
                      {state.parentDocument.description || "No description"}
                    </div>
                    <div className="reference__document__status">
                      <strong>Status:</strong>
                      <span
                        className={`status__badge status__${state.parentDocument.status?.toLowerCase()}`}
                      >
                        {state.parentDocument.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="reference__document__empty">
                  <i className="ri-file-text-line"></i>
                  <p>No parent document attached</p>
                  <span>Attach a parent document to link this document</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Fund Section */}
        <div className="col-md-12 mb-4">
          <div className="fund__section">
            <div className="fund__container">
              <MultiSelect
                label="Budget Heads"
                options={formatOptions(funds, "id", "name", true)}
                value={state.fund}
                onChange={handleFundChange}
                placeholder="Budget Head"
                isSearchable
                isDisabled={false}
              />
            </div>

            <div className="fund__display__card">
              {fundObject ? (
                <div className="fund__card">
                  <div className="fund__card__header">
                    <i className="ri-money-dollar-circle-line"></i>
                    <span className="fund__card__title">
                      Selected Budget Head
                    </span>
                  </div>
                  <div className="fund__card__content">
                    <div className="fund__card__name">
                      <strong>Name:</strong> {fundObject.name || "N/A"}
                    </div>
                    <div className="fund__card__budget_code">
                      <strong>Budget Code:</strong>{" "}
                      {fundObject.budget_code || "N/A"}
                    </div>
                    <div className="fund__card__sub_budget_head">
                      <strong>Sub Budget Head:</strong>{" "}
                      {fundObject.sub_budget_head || "N/A"}
                    </div>
                    <div className="fund__card__type">
                      <strong>Type:</strong>
                      <span className={`type__badge type__${fundObject.type}`}>
                        {fundObject.type}
                      </span>
                    </div>
                    <div className="fund__card__amounts">
                      <div className="fund__card__amount fund__card__amount--approved">
                        <strong>Approved Amount:</strong>
                        <span className="amount__value">
                          ₦
                          {Number(
                            fundObject.total_approved_amount
                          )?.toLocaleString() || "0"}
                        </span>
                      </div>
                      <div className="fund__card__amount fund__card__amount--committed">
                        <strong>Committed Amount:</strong>
                        <span className="amount__value">
                          ₦
                          {fundObject.total_commited_amount?.toLocaleString() ||
                            "0"}
                        </span>
                      </div>
                    </div>
                    <div className="fund__card__year">
                      <strong>Budget Year:</strong>{" "}
                      {fundObject.budget_year || "N/A"}
                    </div>
                    <div className="fund__card__status">
                      <strong>Status:</strong>
                      <span
                        className={`status__badge ${
                          fundObject.is_exhausted
                            ? "status__exhausted"
                            : "status__available"
                        }`}
                      >
                        {fundObject.is_exhausted ? "Exhausted" : "Available"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="fund__card__empty">
                  <i className="ri-money-dollar-circle-line"></i>
                  <p>No budget head selected</p>
                  <span>
                    Select a budget head to allocate funds for this document
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSections;
