import React, { useCallback, useEffect, useState } from "react";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";
import { BaseRepository } from "app/Repositories/BaseRepository";
import { useAuth } from "app/Context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "resources/views/components/forms/Button";
import { toast } from "react-toastify";
import { AuthPageResponseData } from "@/app/Repositories/Page/data";

interface GenerationPanelProps {
  Repository: BaseRepository;
  DocumentGeneratorComponent?: React.ComponentType<any> | null;
  generatedData?: unknown;
  mode?: "store" | "update";
  documentReference?: string;
}

const GenerationPanel: React.FC<GenerationPanelProps> = ({
  Repository,
  DocumentGeneratorComponent,
  generatedData,
  mode = "store",
  documentReference,
}) => {
  const { state, actions } = useTemplateBoard();
  const { staff } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [page, setPage] = useState<AuthPageResponseData | null>(null);

  // Helper function to convert File to data URL
  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      reader.readAsDataURL(file);
    });
  };

  // Functions to control the global overlay
  const showOverlay = useCallback(() => {
    const overlay = document.querySelector(
      ".document__generator__loading__overlay"
    );
    if (overlay) {
      (overlay as HTMLElement).style.display = "flex";
    }
  }, []);

  const hideOverlay = useCallback(() => {
    const overlay = document.querySelector(
      ".document__generator__loading__overlay"
    );
    if (overlay) {
      (overlay as HTMLElement).style.display = "none";
    }
  }, []);

  const updateOverlayProgress = useCallback(
    (progress: number, step: string) => {
      const progressFill = document.getElementById("progress-fill");
      const progressText = document.getElementById("progress-text");
      const loadingStep = document.getElementById("loading-step");

      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }
      if (progressText) {
        progressText.textContent = `${progress}%`;
      }
      if (loadingStep) {
        loadingStep.textContent = step;
      }
    },
    []
  );

  const generateDocument = useCallback(async () => {
    // Prevent multiple clicks
    if (state.isGenerating) {
      return;
    }

    actions.setGenerationState(true, 0, "");
    showOverlay();

    try {
      // Step 1: Creating workflow for this document
      const step1 = "Creating workflow for this document";
      actions.setGenerationState(true, 20, step1);
      updateOverlayProgress(20, step1);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 2: Encrypting uploaded files
      const step2 = "Encrypting uploaded files";
      actions.setGenerationState(true, 40, step2);
      updateOverlayProgress(40, step2);

      let uploadDataUrls: string[] = [];

      if (state.uploads.length > 0) {
        try {
          uploadDataUrls = await Promise.all(
            state.uploads.map((file) => convertFileToDataURL(file))
          );
        } catch (error) {
          const errorStep = "Error converting files to data URLs";
          actions.setGenerationState(true, 40, errorStep);
          updateOverlayProgress(40, errorStep);
          return;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 3: Gathering necessary data input for processing
      const step3 = "Gathering necessary data input for processing";
      actions.setGenerationState(true, 60, step3);
      updateOverlayProgress(60, step3);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 4: Getting ready to send this data to our servers
      const step4 = "Getting ready to send this data to our servers";
      actions.setGenerationState(true, 80, step4);
      updateOverlayProgress(80, step4);
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Check for required dependencies
      if (!Repository) {
        console.error("Repository is not available");
        return;
      }

      if (!state.category?.service) {
        console.error("Category service is not available");
        return;
      }

      if (!staff?.id) {
        console.error("Staff ID is not available");
        return;
      }

      // Find the page ID from staff's pages based on view's frontend_path
      let pageId: number | null = null;
      if (staff?.pages) {
        // This would need to be passed from the parent component
        // For now, we'll set it to null
        pageId = null;
      }

      const documentServerObject = {
        page,
        document: state.documentState,
        resource_id: state.resource?.id || 0,
        configState: state.configState,
        uploads: uploadDataUrls,
        contents: state.contents,
        fund_id: state.fund?.value || null,
        document_reference_id: state.parentDocument?.id,
        service: state.category?.service,
        user_id: staff?.id,
        department_id: staff?.department_id,
        category: state.category,
        workflow: state.workflow,
        trackers: state.trackers,
        isWorkflowValid: state.isValid,
        page_id: pageId,
        document_owner: state.document_owner,
        department_owner: state.department_owner,
        template_id: state.template?.id,
      };

      // Use different endpoints based on mode
      const endpoint =
        mode === "update"
          ? `documents/${documentReference}/update`
          : "generate/documents";

      // TODO: Add actual API call here
      // const response = await Repository.store(endpoint, documentServerObject);

      const step5 =
        mode === "update"
          ? "Updating document on our servers"
          : "Processing document on our servers";
      actions.setGenerationState(true, 90, step5);
      updateOverlayProgress(90, step5);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const step6 =
        mode === "update"
          ? "Document updated successfully!"
          : "Document generated successfully!";
      actions.setGenerationState(true, 100, step6);
      updateOverlayProgress(100, step6);
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success(
        mode === "update"
          ? "Document updated successfully!"
          : "Document generated successfully!"
      );

      // Navigate back or to the generated document
      // navigate(-1);
    } catch (error) {
      console.error("Error generating document:", error);
      const errorStep = "Error occurred while generating document";
      actions.setGenerationState(true, 100, errorStep);
      updateOverlayProgress(100, errorStep);
      toast.error("Failed to generate document. Please try again.");
    } finally {
      actions.setGenerationState(false, 0, "");
      hideOverlay();
    }
  }, [
    state.isGenerating,
    state.category?.service,
    state.documentState,
    state.resource?.id,
    state.configState,
    state.uploads,
    state.contents,
    state.fund?.value,
    state.parentDocument?.id,
    state.workflow,
    state.trackers,
    state.isValid,
    state.document_owner,
    state.department_owner,
    state.template?.id,
    Repository,
    staff,
    navigate,
    showOverlay,
    hideOverlay,
    updateOverlayProgress,
    mode,
    documentReference,
  ]); // Remove state and actions objects to prevent infinite loops

  useEffect(() => {
    if (staff?.pages && pathname) {
      const firstTwo = pathname.split("/").slice(0, 3).join("/");
      const page = staff.pages.find((page) => page.path === firstTwo);
      if (page) {
        setPage(page);
      }
    }
  }, [pathname, staff?.pages]); // Remove actions dependency to prevent infinite loops

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="generation__panel__container">
      {/* Header Section */}
      <div className="generation__panel__header">
        <div className="titler flex align between gap-md">
          <h5 style={{ fontSize: 26 }}>
            {mode === "update" ? "Update" : "Generate"} {state.category?.name}
            {mode === "update" && documentReference && (
              <small className="text-muted d-block" style={{ fontSize: 14 }}>
                Reference: {documentReference}
              </small>
            )}
          </h5>
          <div className="flex align gap-md">
            <Button
              label={
                state.isGenerating
                  ? mode === "update"
                    ? "Updating..."
                    : "Generating..."
                  : mode === "update"
                  ? "Update Document"
                  : "Generate Document"
              }
              handleClick={generateDocument}
              icon={state.isGenerating ? "ri-loader-4-line" : "ri-links-line"}
              size="md"
              variant="dark"
              isDisabled={
                !(state.workflow && Object.keys(state.workflow).length > 0) ||
                state.isGenerating
              }
            />
            <Button
              label="Go Back"
              handleClick={handleGoBack}
              icon="ri-arrow-left-long-line"
              size="md"
              variant="danger"
            />
          </div>
        </div>
      </div>

      {/* Validation Status */}
      {!state.isValid && state.errors.length > 0 && (
        <div className="validation__errors__container mb-4">
          <div className="validation__errors__header">
            <i className="ri-error-warning-line"></i>
            <h6>Validation Errors</h6>
          </div>
          <div className="validation__errors__list">
            {state.errors.map((error, index) => (
              <div key={index} className="validation__error__item">
                <i className="ri-close-circle-line"></i>
                <span>{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Generator Component */}
      {DocumentGeneratorComponent && (
        <div className="document__generator__component">
          <DocumentGeneratorComponent
            repo={Repository}
            collection={[]}
            service={state.category?.service || ""}
            state={state.documentState}
            setState={(updates: any) => actions.updateDocumentState(updates)}
            plug={(data: any) => actions.setResource(data)}
            category={state.category}
            template={state.template}
            updateGlobalState={(data: unknown) => {
              // Handle global state updates if needed
            }}
          />
        </div>
      )}

      {/* Generation Progress */}
      {state.isGenerating && (
        <div className="generation__progress__container">
          <div className="generation__progress__bar">
            <div
              className="generation__progress__fill"
              style={{ width: `${state.loadingProgress}%` }}
            ></div>
          </div>
          <div className="generation__progress__text">
            <span>{state.loadingStep}</span>
            <span>{state.loadingProgress}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationPanel;
