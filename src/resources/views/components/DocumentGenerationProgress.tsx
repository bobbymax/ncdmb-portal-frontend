import React, { useState, useEffect } from "react";
import Alert from "app/Support/Alert";

interface DocumentGenerationProgressProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "error";
  duration: number; // in milliseconds
}

const DocumentGenerationProgress: React.FC<DocumentGenerationProgressProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: "gathering",
      title: "Gathering Document Data",
      description:
        "Collecting all document content, blocks, and configurations",
      status: "pending",
      duration: 2000,
    },
    {
      id: "fetching",
      title: "Fetching Document Policies & Preferences",
      description:
        "Retrieving document policies, user preferences, and supporting files",
      status: "pending",
      duration: 2500,
    },
    {
      id: "encrypting",
      title: "Encrypting Uploaded Files",
      description:
        "Securing all uploaded files with enterprise-grade encryption",
      status: "pending",
      duration: 3000,
    },
    {
      id: "preparing",
      title: "Preparing Document for Servers",
      description:
        "Finalizing document structure and preparing for backend processing",
      status: "pending",
      duration: 2000,
    },
    {
      id: "submitting",
      title: "Data Submitted Successfully",
      description: "Document has been successfully submitted to our servers",
      status: "pending",
      duration: 1000,
    },
  ]);

  useEffect(() => {
    if (isOpen && !isProcessing) {
      // Add modal-open class to body to prevent scrolling
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");

      // Reset steps to pending when modal opens
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({ ...step, status: "pending" as const }))
      );

      startProgress();
    } else if (!isOpen) {
      // Remove modal-open class when modal is closed
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    };
  }, []);

  const startProgress = async () => {
    setIsProcessing(true);
    setCurrentStep(0);
    setProgress(0);

    // Reset all steps to pending
    setSteps((prevSteps) =>
      prevSteps.map((step) => ({ ...step, status: "pending" as const }))
    );

    for (let i = 0; i < steps.length; i++) {
      // Update current step
      setCurrentStep(i);

      // Update step status to active
      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === i ? { ...step, status: "active" as const } : step
        )
      );

      // Simulate step processing
      await simulateStepProgress(steps[i].duration);

      // Mark step as completed
      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === i ? { ...step, status: "completed" as const } : step
        )
      );

      // Update overall progress
      const newProgress = ((i + 1) / steps.length) * 100;
      setProgress(newProgress);

      // Small delay between steps
      if (i < steps.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Complete the process
    setIsProcessing(false);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 1500);
  };

  const simulateStepProgress = (duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="document-generation-progress-overlay">
      <div className="document-generation-progress-modal">
        {/* Header */}
        <div className="progress-header">
          <div className="header-content">
            <div className="header-icon">
              <i className="ri-file-download-line"></i>
            </div>
            <div className="header-text">
              <h2>Generating Your Document</h2>
              <p>Please wait while we process your document...</p>
            </div>
          </div>
          <div className="progress-percentage">
            <span className="percentage-number">{Math.round(progress)}%</span>
            <span className="percentage-label">Complete</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Steps */}
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`progress-step ${step.status} ${
                index === currentStep ? "current" : ""
              }`}
            >
              <div className="step-indicator">
                <div className="step-icon">
                  {step.status === "completed" && (
                    <i className="ri-check-line"></i>
                  )}
                  {step.status === "active" && (
                    <div className="loading-spinner"></div>
                  )}
                  {step.status === "pending" && (
                    <span className="step-number">{index + 1}</span>
                  )}
                  {step.status === "error" && (
                    <i className="ri-error-warning-line"></i>
                  )}
                </div>
                <div className="step-connector"></div>
              </div>

              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>

                {step.status === "active" && (
                  <div className="step-progress">
                    <div className="step-progress-bar">
                      <div className="step-progress-fill"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="progress-footer">
          <div className="footer-info">
            <i className="ri-shield-check-line"></i>
            <span>Your document is being processed securely</span>
          </div>

          {!isProcessing && progress === 100 && (
            <div className="completion-message">
              <i className="ri-check-double-line"></i>
              <span>Document generated successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentGenerationProgress;
