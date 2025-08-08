import React, { useState, useCallback } from "react";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { DocumentResponseData } from "@/app/Repositories/Document/data";
import { FundResponseData } from "@/app/Repositories/Fund/data";
import useDirectories from "app/Hooks/useDirectories";
import { repo } from "bootstrap/repositories";
import { ActionMeta } from "react-select";
import { toast } from "react-toastify";
import Dropzone from "resources/views/components/forms/Dropzone";
import DocumentProcessFlow from "resources/views/components/tabs/DocumentProcessFlow";
import WorkflowPreview from "resources/views/components/pages/WorkflowPreview";
import useProcessFlowTypes from "app/Hooks/useProcessFlowTypes";

interface DocumentConfiguratorProps {
  Repository: BaseRepository;
}

const DocumentConfigurator: React.FC<DocumentConfiguratorProps> = ({
  Repository,
}) => {
  const { state, actions } = useTemplateBoard();
  const [parentDocument, setParentDocument] = useState<string>("");
  const [isAttachingDocument, setIsAttachingDocument] = useState(false);
  const [fundObject, setFundObject] = useState<FundResponseData | null>(null);

  const { collection: funds } = useDirectories(repo("fund"), "funds");
  const { processTypeOptions } = useProcessFlowTypes();

  const handleDocumentStateChange = useCallback(
    (field: keyof DocumentResponseData, value: any) => {
      actions.updateDocumentState({ [field]: value });
    },
    [actions]
  );

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

  const handleUploadsChange = useCallback(
    (files: File[] | ((prevFiles: File[]) => File[])) => {
      // console.log("🔍 DocumentConfigurator: handleUploadsChange called");
      // console.log(
      //   "🔍 DocumentConfigurator: Current state.uploads:",
      //   state.uploads
      // );

      const newFiles =
        typeof files === "function" ? files(state.uploads) : files;

      console.log("🔍 DocumentConfigurator: New files to add:", newFiles);

      // Clear existing uploads by removing them one by one
      // This preserves all other state while only managing uploads
      const currentUploadsCount = state.uploads.length;
      console.log(
        "🔍 DocumentConfigurator: Clearing",
        currentUploadsCount,
        "existing uploads"
      );

      for (let i = currentUploadsCount - 1; i >= 0; i--) {
        actions.removeUpload(i);
      }

      // Add new files
      console.log(
        "🔍 DocumentConfigurator: Adding",
        newFiles.length,
        "new files"
      );
      newFiles.forEach((file) => actions.addUpload(file));

      console.log("🔍 DocumentConfigurator: Uploads change completed");
    },
    [actions, state.uploads]
  );

  const handleRemoveUpload = useCallback(
    (index: number) => {
      actions.removeUpload(index);
    },
    [actions]
  );

  return (
    <div className="document__configurator__container">
      {/* Process Flow Configuration */}
      <div className="process__flow__container mb-4">
        <DocumentProcessFlow
          processTypeOptions={processTypeOptions}
          activeTab={state.processType}
          configState={state.configState}
          setConfigState={actions.updateConfigState}
          setActiveTab={actions.setProcessType}
          isDisplay
        />
      </div>

      {/* Workflow Preview */}
      <div className="workflow__preview__section mb-4">
        <WorkflowPreview
          workflow={state.workflow}
          trackers={state.trackers}
          isValid={Boolean(
            state.workflow && Object.keys(state.workflow).length > 0
          )}
          errors={state.errors}
        />
      </div>

      {/* File Uploads */}
      <div className="uploads__container__section">
        <div className="uploads__container flex column gap-md">
          <Dropzone
            label="Upload Supporting Documents"
            files={state.uploads}
            setFiles={handleUploadsChange}
          />
          <div className="uploaded__files__container">
            {state.uploads.length > 0 ? (
              state.uploads.map((upload, index) => {
                const isPdf = upload.name.toLowerCase().endsWith(".pdf");
                return (
                  <div
                    key={upload.name}
                    className={`uploaded__file__item ${
                      isPdf ? "uploaded__file__pdf" : "uploaded__file__image"
                    }`}
                  >
                    <i
                      className={
                        isPdf ? "ri-file-pdf-2-line" : "ri-file-image-line"
                      }
                    ></i>
                    <span className="uploaded__file__name">{upload.name}</span>
                    <button
                      className="uploaded__file__remove"
                      onClick={() => handleRemoveUpload(index)}
                      title="Remove file"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="uploaded__files__empty">
                <i className="ri-folder-open-line"></i>
                <p>No files uploaded</p>
                <span>
                  Upload supporting documents to attach to this document
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentConfigurator;
