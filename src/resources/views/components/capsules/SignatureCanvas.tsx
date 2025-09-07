import { SignatureResponseData } from "app/Repositories/Signature/data";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SelectedActionsProps } from "../../crud/DocumentCategoryConfiguration";
import Button from "../forms/Button";
import SignatureCanvas from "react-signature-canvas";

interface SignatureCanvasProps {
  signatureUrl: string;
  styles?: { [key: string]: string | number };
  signature?: SignatureResponseData | null;
  canSign?: boolean;
  selectedAction?: SelectedActionsProps | null;
  onSignatureSave?: (signatureData: string) => void;
}

const SignatureCanvasComponent = ({
  signatureUrl,
  styles,
  signature,
  canSign,
  selectedAction,
  onSignatureSave,
}: SignatureCanvasProps) => {
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signaturePadRef = useRef<SignatureCanvas | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUploadOption, setShowUploadOption] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Determine if we should show interactive mode
  const shouldShowInteractivePad = canSign && !signatureUrl && selectedAction;

  // Remove auto-start signing - now handled by modal
  // useEffect(() => {
  //   if (shouldShowInteractivePad && !isSigning) {
  //     setIsSigning(true);
  //   }
  // }, [shouldShowInteractivePad, isSigning]);

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

  const handleStartSigning = () => {
    setShowModal(true);
    setIsSigning(true);
    setHasUnsavedChanges(false);
    // Add modal-open class to prevent body scrolling
    document.body.classList.add("modal-open");
    document.documentElement.classList.add("modal-open");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsSigning(false);
    setHasUnsavedChanges(false);
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    // Remove modal-open class to restore body scrolling
    document.body.classList.remove("modal-open");
    document.documentElement.classList.remove("modal-open");
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setHasUnsavedChanges(false);
    }
  };

  const handleSaveSignature = () => {
    if (signaturePadRef.current?.isEmpty()) {
      alert("Please provide a signature.");
      return;
    }

    const signatureData = signaturePadRef.current?.toDataURL("image/png") || "";
    onSignatureSave?.(signatureData);
    handleCloseModal();
  };

  const handleCancelSigning = () => {
    handleCloseModal();
  };

  const handleSignatureChange = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  return (
    <div className="canvas__block">
      {/* Display Canvas - Show existing signature */}
      {signatureUrl && (
        <canvas
          ref={displayCanvasRef}
          className="signature-container"
          style={{
            ...styles,
            pointerEvents: "none",
            userSelect: "none",
            background: "transparent",
          }}
        />
      )}

      {/* Placeholder when no signature */}
      {!signatureUrl && (
        <div
          className={`signature__placeholder ${
            canSign ? "signature__placeholder--interactive" : ""
          }`}
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
        <small className="signature__user__name">
          {signature.approving_officer?.name}
        </small>
      )}

      {/* Signature Modal - Rendered via Portal */}
      {showModal &&
        createPortal(
          <div className="signature__modal__overlay" onClick={handleCloseModal}>
            <div
              className="signature__modal"
              onClick={(e) => e.stopPropagation()}
            >
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
                    canvasProps={{
                      width: 500,
                      height: 200,
                      className: "signature-pad-canvas",
                    }}
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
                    onClick={() => setShowUploadOption(!showUploadOption)}
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
};

export default SignatureCanvasComponent;
