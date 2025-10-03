import { SignatureResponseData } from "app/Repositories/Signature/data";
import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import { SelectedActionsProps } from "../../crud/DocumentCategoryConfiguration";
import Button from "../forms/Button";
import SignatureCanvas from "react-signature-canvas";
import {
  CategoryProgressTrackerProps,
  DocumentCategoryResponseData,
} from "@/app/Repositories/DocumentCategory/data";
import { TemplateResponseData } from "@/app/Repositories/Template/data";
import pluralize from "pluralize";
import moment from "moment";

interface SignatureCanvasProps {
  signatureUrl: string;
  tracker: CategoryProgressTrackerProps | null;
  styles?: { [key: string]: string | number };
  signature?: SignatureResponseData | null;
  category: DocumentCategoryResponseData | null;
  canSign?: boolean;
  selectedAction?: SelectedActionsProps | null;
  onSignatureSave?: (signatureData: string) => void;
  // Pass group data directly to avoid context dependency
  groupName?: string;
  templateSignatureDisplay?: string;
}

const SignatureCanvasComponent = memo(
  ({
    signatureUrl,
    tracker,
    styles,
    signature,
    category,
    canSign,
    selectedAction,
    onSignatureSave,
    groupName,
    templateSignatureDisplay,
  }: SignatureCanvasProps) => {
    const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const signaturePadRef = useRef<SignatureCanvas | null>(null);
    const [isSigning, setIsSigning] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showUploadOption, setShowUploadOption] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Memoize computed values to prevent unnecessary recalculations
    const shouldShowInteractivePad = useMemo(
      () => canSign && !signatureUrl && selectedAction,
      [canSign, signatureUrl, selectedAction]
    );

    // Use passed props instead of context to avoid re-renders
    const assigned = useMemo(() => {
      return {
        template: {
          signature_display:
            templateSignatureDisplay || category?.template?.signature_display,
        },
        group: { name: groupName },
      };
    }, [
      templateSignatureDisplay,
      category?.template?.signature_display,
      groupName,
    ]);

    // Memoize event handlers to prevent unnecessary re-renders
    const handleStartSigning = useCallback(() => {
      setShowModal(true);
      setIsSigning(true);
      setHasUnsavedChanges(false);
      // Add modal-open class to prevent body scrolling
      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
    }, []);

    const handleCloseModal = useCallback(() => {
      setShowModal(false);
      setIsSigning(false);
      setHasUnsavedChanges(false);
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
      }
      // Remove modal-open class to restore body scrolling
      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }, []);

    const handleClearSignature = useCallback(() => {
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
        setHasUnsavedChanges(false);
      }
    }, []);

    const handleSaveSignature = useCallback(() => {
      if (signaturePadRef.current?.isEmpty()) {
        alert("Please provide a signature.");
        return;
      }

      const signatureData =
        signaturePadRef.current?.toDataURL("image/png") || "";
      onSignatureSave?.(signatureData);
      handleCloseModal();
    }, [onSignatureSave, handleCloseModal]);

    const handleCancelSigning = useCallback(() => {
      handleCloseModal();
    }, [handleCloseModal]);

    const handleSignatureChange = useCallback(() => {
      if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
        setHasUnsavedChanges(true);
      } else {
        setHasUnsavedChanges(false);
      }
    }, []);

    const handleFileUpload = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert("Please select an image file.");
          return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          alert("File size must be less than 2MB.");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            // Convert uploaded image to signature format
            onSignatureSave?.(result);
            setShowUploadOption(false);
            handleCloseModal();
          }
        };
        reader.readAsDataURL(file);
      },
      [onSignatureSave, handleCloseModal]
    );

    const handleToggleUploadOption = useCallback(() => {
      setShowUploadOption(!showUploadOption);
    }, [showUploadOption]);

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
          handleCloseModal();
        }
      },
      [handleCloseModal]
    );

    const handleModalClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
    }, []);

    // Reset signing state when signature is provided (after save)
    useEffect(() => {
      if (signatureUrl && isSigning) {
        setIsSigning(false);
        setHasUnsavedChanges(false);
      }
    }, [signatureUrl, isSigning]);

    // Cleanup modal-open class on unmount
    useEffect(() => {
      return () => {
        document.body.classList.remove("modal-open");
        document.documentElement.classList.remove("modal-open");
      };
    }, []);

    // Display mode - show existing signature
    useEffect(() => {
      if (!shouldShowInteractivePad && signatureUrl) {
        const canvas = displayCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = signatureUrl;

        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          // Remove white background
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            if (r > 220 && g > 220 && b > 220) {
              data[i + 3] = 0;
            }
          }

          ctx.putImageData(imageData, 0, 0);
        };
      }
    }, [signatureUrl, shouldShowInteractivePad]);

    // Memoize canvas styles to prevent object recreation
    const canvasStyles = useMemo(
      () => ({
        ...styles,
        pointerEvents: "none" as const,
        userSelect: "none" as const,
        background: "transparent",
      }),
      [styles]
    );

    // Memoize canvas props for signature pad
    const signatureCanvasProps = useMemo(
      () => ({
        width: 500,
        height: 200,
        className: "signature-pad-canvas",
      }),
      []
    );

    // Memoize placeholder class to prevent string concatenation on every render
    const placeholderClass = useMemo(
      () =>
        `signature__placeholder ${
          canSign ? "signature__placeholder--interactive" : ""
        }`,
      [canSign]
    );

    return (
      <div className="canvas__block">
        {/* Display Canvas - Show existing signature */}
        {signatureUrl && (
          <canvas
            ref={displayCanvasRef}
            className="signature-container"
            style={canvasStyles}
          />
        )}

        {/* Placeholder when no signature */}
        {!signatureUrl && (
          <div
            className={placeholderClass}
            onClick={canSign ? handleStartSigning : undefined}
          >
            <div className="signature__placeholder__content">
              <i className="ri-quill-pen-line"></i>
              <span>{canSign ? "Click to Sign" : "Signature Area"}</span>
            </div>
          </div>
        )}

        {/* User Name Label */}
        {signature && (
          <div className="signature__user__info">
            {assigned.template?.signature_display === "group" ? (
              <small className="signature__user__name signature__group__name">
                {pluralize.singular(assigned.group?.name || "Unknown Group")}
              </small>
            ) : assigned.template?.signature_display === "name" ? (
              <small className="signature__user__name signature__individual__name">
                {signature.approving_officer?.name || "Unknown User"}
              </small>
            ) : assigned.template?.signature_display === "both" ? (
              <div className="signature__user__name signature__both__display">
                <div className="signature__group__lead">
                  {pluralize.singular(assigned.group?.name || "Unknown Group")}
                </div>
                <div className="signature__individual__sub">
                  {signature.approving_officer?.name || "Unknown User"}
                </div>
              </div>
            ) : (
              <small className="signature__user__name">
                {signature.approving_officer?.name || "Unknown User"}
              </small>
            )}
          </div>
        )}

        {/* Handwritten Date - Only shows when signature exists */}
        {signatureUrl && signature && (
          <div>
            {moment(signature.created_at || signature.updated_at).format(
              "MMM DD, YYYY"
            )}
          </div>
        )}

        {/* Signature Modal - Rendered via Portal */}
        {showModal &&
          createPortal(
            <div
              className="signature__modal__overlay"
              onClick={handleOverlayClick}
            >
              <div className="signature__modal" onClick={handleModalClick}>
                <div className="signature__modal__header">
                  <h4>Sign Document</h4>
                  <button
                    className="signature__modal__close"
                    onClick={handleCloseModal}
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="signature__modal__content">
                  <div className="signature__pad__wrapper">
                    <SignatureCanvas
                      ref={(ref) => (signaturePadRef.current = ref)}
                      canvasProps={signatureCanvasProps}
                      onEnd={handleSignatureChange}
                    />
                  </div>

                  {/* File Upload Option */}
                  {showUploadOption && (
                    <div className="signature__upload__container">
                      <div className="signature__upload__wrapper">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="signature__upload__input"
                          id="signature-upload"
                        />
                        <label
                          htmlFor="signature-upload"
                          className="signature__upload__label"
                        >
                          <i className="ri-image-add-line"></i>
                          <span>Choose Signature Image</span>
                          <small>PNG, JPG, GIF (max 2MB)</small>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="signature__modal__footer">
                  <div className="signature__pad__controls">
                    <button
                      className="btn__secondary btn__sm"
                      onClick={handleClearSignature}
                      disabled={!hasUnsavedChanges}
                    >
                      <i className="ri-eraser-line"></i>
                      Clear
                    </button>
                    <button
                      className="btn__info btn__sm"
                      onClick={handleToggleUploadOption}
                    >
                      <i className="ri-upload-line"></i>
                      Upload
                    </button>
                    <button
                      className="btn__success btn__sm"
                      onClick={handleSaveSignature}
                      disabled={!hasUnsavedChanges}
                    >
                      <i className="ri-check-line"></i>
                      Save Signature
                    </button>
                    <button
                      className="btn__danger btn__sm"
                      onClick={handleCancelSigning}
                    >
                      <i className="ri-close-line"></i>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  }
);

SignatureCanvasComponent.displayName = "SignatureCanvasComponent";

export default SignatureCanvasComponent;
