import { usePaperBoard } from "app/Context/PaperBoardContext";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import React, { useEffect, useState, Suspense, lazy } from "react";
import { ProgressTrackerResponseData } from "@/app/Repositories/ProgressTracker/data";

interface ProcessGeneratorTabProps {
  category: DocumentCategoryResponseData | null;
}

// Dynamic component loader for ProcessCards
const loadProcessCardComponent = (componentName: string) => {
  return lazy(() =>
    import(`../ProcessCards/${componentName}`).catch((error) => {
      console.error(
        `Failed to load ProcessCard component: ${componentName}`,
        error
      );
      // Return a fallback component
      return {
        default: () => (
          <div className="alert alert-warning">
            <i className="ri-error-warning-line"></i> ProcessCard component
            &quot;{componentName}&quot; not found.
          </div>
        ),
      };
    })
  );
};

const ProcessGeneratorTab: React.FC<ProcessGeneratorTabProps> = ({
  category,
}) => {
  const { state, actions } = usePaperBoard();

  const [currentProcess, setCurrentProcess] =
    useState<ProgressTrackerResponseData | null>(null);

  const [ProcessCardComponent, setProcessCardComponent] =
    useState<React.LazyExoticComponent<React.ComponentType<any>> | null>(null);

  // Update current process when document changes
  useEffect(() => {
    if (
      state.existingDocument &&
      state.existingDocument?.processes &&
      state.existingDocument?.processes.length > 0 &&
      state.existingDocument?.progress_tracker_id > 0
    ) {
      const process = state.existingDocument?.processes.find(
        (process) => process.id === state.existingDocument?.progress_tracker_id
      );

      if (process) {
        setCurrentProcess(process);
      }
    } else {
      setCurrentProcess(null);
      setProcessCardComponent(null);
    }
  }, [state.existingDocument]);

  // Dynamically load ProcessCard component when currentProcess changes
  useEffect(() => {
    if (currentProcess?.process_card?.component) {
      const componentName = currentProcess.process_card.component;
      //   console.log("Loading ProcessCard component:", componentName);

      const Component = loadProcessCardComponent(componentName);
      setProcessCardComponent(Component);
    } else {
      setProcessCardComponent(null);
    }
  }, [currentProcess]);

  return (
    <div className="process-generator-tab">
      <div className="process-card-container">
        {currentProcess?.process_card ? (
          <div className="process-card-wrapper">
            {/* ProcessCard Header */}
            <div className="process-card-header mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="mb-1">
                    <i className="ri-sticky-note-line me-2"></i>
                    {currentProcess.process_card.name}
                  </h5>
                  <small className="text-muted">
                    Stage {currentProcess.order}:{" "}
                    {currentProcess.stage?.name || "Unknown Stage"}
                  </small>
                </div>
                <div>
                  <span
                    className={`badge ${
                      currentProcess.process_card.is_disabled
                        ? "bg-secondary"
                        : "bg-success"
                    }`}
                  >
                    {currentProcess.process_card.is_disabled
                      ? "Disabled"
                      : "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic ProcessCard Component */}
            {ProcessCardComponent ? (
              <Suspense
                fallback={
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">
                        Loading ProcessCard...
                      </span>
                    </div>
                    <p className="mt-2 text-muted">
                      Loading {currentProcess.process_card.component}...
                    </p>
                  </div>
                }
              >
                <ProcessCardComponent
                  processCard={currentProcess.process_card}
                  currentProcess={currentProcess}
                  existingDocument={state.existingDocument}
                  resource={state.existingDocument?.documentable}
                />
              </Suspense>
            ) : (
              <div className="alert alert-info">
                <i className="ri-information-line"></i> No component specified
                for this ProcessCard.
              </div>
            )}
          </div>
        ) : (
          <div className="alert alert-secondary">
            <i className="ri-information-line"></i> No ProcessCard attached to
            the current stage.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessGeneratorTab;
