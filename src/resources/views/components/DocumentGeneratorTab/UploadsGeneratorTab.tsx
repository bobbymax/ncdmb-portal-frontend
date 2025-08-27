import React, { useState, useEffect, useCallback } from "react";
import { usePaperBoard } from "app/Context/PaperBoardContext";
import Dropzone from "../forms/Dropzone";

interface UploadsGeneratorTabProps {
  category: any;
}

const UploadsGeneratorTab: React.FC<UploadsGeneratorTabProps> = ({
  category,
}) => {
  const { state, actions } = usePaperBoard();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationType, setValidationType] = useState<"warning" | "error">(
    "warning"
  );

  // File size validation constants
  const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB per file
  const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15MB total

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper function to validate file sizes
  const validateFileSizes = (
    files: File[]
  ): { isValid: boolean; error: string | null; type: "warning" | "error" } => {
    // Check individual file sizes
    const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map((f) => f.name).join(", ");
      return {
        isValid: false,
        error: `Files exceeding 4MB limit: ${fileNames}`,
        type: "error",
      };
    }

    // Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      return {
        isValid: false,
        error: `Total upload size (${formatFileSize(
          totalSize
        )}) exceeds 15MB limit`,
        type: "warning",
      };
    }

    return { isValid: true, error: null, type: "warning" };
  };

  // Helper function to clear validation error
  const clearValidationError = () => {
    setValidationError(null);
    setValidationType("warning");
  };

  // Real-time validation for drag and drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      const validation = validateFileSizes(files);
      if (!validation.isValid) {
        setValidationError(validation.error);
        setValidationType(validation.type);
      } else {
        clearValidationError();
      }
    }
  };

  useEffect(() => {
    // Initialize uploaded files from global state
    if (state.uploads && state.uploads.length > 0) {
      try {
        // Filter out any invalid files and convert to File objects if needed
        const validFiles = state.uploads
          .map((upload: any) => {
            if (upload instanceof File) {
              return upload;
            } else if (
              upload &&
              typeof upload === "object" &&
              upload.file instanceof File
            ) {
              return upload.file;
            }
            return null;
          })
          .filter((file): file is File => file !== null);

        setUploadedFiles(validFiles);
      } catch (error) {
        console.error("Error initializing uploaded files:", error);
        setUploadedFiles([]);
      }
    } else {
      setUploadedFiles([]);
    }
  }, [state.uploads]);

  // Separate effect to initialize progress for files without progress tracking
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      initializeProgress(uploadedFiles);
    }
  }, [uploadedFiles.length]); // Only run when the number of files changes

  const handleUploadsChange = useCallback(
    (files: File[] | ((prevFiles: File[]) => File[])) => {
      const newFiles =
        typeof files === "function" ? files(state.uploads) : files;

      // Validate file sizes before proceeding
      const validation = validateFileSizes(newFiles);

      if (!validation.isValid) {
        setValidationError(validation.error);
        setValidationType(validation.type);
        return; // Don't proceed with upload if validation fails
      }

      // Clear validation error if files are valid
      clearValidationError();

      // Clear existing uploads by setting to empty array
      actions.setUploads([]);

      // Add new files
      newFiles.forEach((file) => {
        actions.addUpload(file);
      });
    },
    [actions, state.uploads]
  );

  // Initialize progress tracking for new files
  const initializeProgress = (files: File[]) => {
    files.forEach((file) => {
      if (!uploadProgress[file.name]) {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        simulateUploadProgress(file.name);
      }
    });
  };

  const simulateUploadProgress = (fileName: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress((prev) => ({ ...prev, [fileName]: progress }));
    }, 200);
  };

  const handleRemoveFile = (fileName: string) => {
    try {
      // Find the file to remove by name
      const fileToRemove = state.uploads.find((upload: any) => {
        if (upload instanceof File) {
          return upload.name === fileName;
        } else if (upload && typeof upload === "object" && upload.file) {
          return upload.file.name === fileName;
        } else if (upload && typeof upload === "object" && upload.name) {
          return upload.name === fileName;
        }
        return false;
      });

      if (fileToRemove) {
        // Remove the file by passing the filename to removeUpload
        actions.removeUpload(fileName);

        // Remove progress tracking
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileName];
          return newProgress;
        });

        // Note: Don't update local state here - let useEffect handle it
        // when global state changes
      } else {
        console.warn(`File with name "${fileName}" not found in uploads`);
      }
    } catch (error) {
      console.error("Error removing file:", error);
      // Fallback: try to update global state directly
      try {
        const currentFiles = state.uploads.filter((upload: any) => {
          if (upload instanceof File) {
            return upload.name !== fileName;
          } else if (upload && typeof upload === "object" && upload.file) {
            return upload.file.name !== fileName;
          } else if (upload && typeof upload === "object" && upload.name) {
            return upload.name !== fileName;
          }
          return true; // Keep files we can't identify
        });

        actions.setUploads(currentFiles as any);

        // Remove progress tracking
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileName];
          return newProgress;
        });
      } catch (fallbackError) {
        console.error("Fallback file removal also failed:", fallbackError);
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "ri-file-pdf-line";
      case "doc":
      case "docx":
        return "ri-file-word-line";
      case "xls":
      case "xlsx":
        return "ri-file-excel-line";
      case "jpg":
      case "jpeg":
      case "png":
        return "ri-image-line";
      default:
        return "ri-file-line";
    }
  };

  return (
    <div className="uploads__generator__tab">
      <div
        className="uploads__header"
        onDragOver={handleDragOver}
        onDrop={(e) => e.preventDefault()}
      >
        <h3>Document Uploads</h3>
        <div className="upload__input__wrapper">
          <div className="upload__info">
            <Dropzone
              label="Upload Supporting Documents"
              files={state.uploads as File[]}
              setFiles={handleUploadsChange}
            />
            <div className="upload__limits">
              <span className="limit__item">
                <i className="ri-file-line"></i>
                Max 4MB per file
              </span>
              <span className="limit__item">
                <i className="ri-hard-drive-line"></i>
                Max 15MB total
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* File Size Validation Error Display */}
      {validationError && (
        <div className={`validation__error ${validationType}`}>
          <div className="validation__icon">
            <i
              className={
                validationType === "error"
                  ? "ri-error-warning-line"
                  : "ri-information-line"
              }
            ></i>
          </div>
          <div className="validation__content">
            <h4>
              {validationType === "error" ? "Upload Blocked" : "Upload Warning"}
            </h4>
            <p>{validationError}</p>
            <div className="validation__rules">
              <span className="rule">
                <i className="ri-check-line"></i>
                Individual files must be under 4MB
              </span>
              <span className="rule">
                <i className="ri-check-line"></i>
                Total upload size must be under 15MB
              </span>
            </div>
          </div>
          <button
            className="validation__close"
            onClick={clearValidationError}
            title="Dismiss"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* File Size Status Indicator */}
      {uploadedFiles.length > 0 && (
        <div className="file__size__status">
          <div className="status__header">
            <i className="ri-hard-drive-line"></i>
            <span>Upload Status</span>
          </div>
          <div className="status__details">
            <div className="status__item">
              <span className="label">Files:</span>
              <span className="value">{uploadedFiles.length}</span>
            </div>
            <div className="status__item">
              <span className="label">Total Size:</span>
              <span className="value">
                {formatFileSize(
                  uploadedFiles.reduce((sum, file) => sum + file.size, 0)
                )}
              </span>
            </div>
            <div className="status__item">
              <span className="label">Remaining:</span>
              <span
                className={`value ${
                  uploadedFiles.reduce((sum, file) => sum + file.size, 0) >
                  MAX_TOTAL_SIZE
                    ? "exceeded"
                    : "available"
                }`}
              >
                {formatFileSize(
                  Math.max(
                    0,
                    MAX_TOTAL_SIZE -
                      uploadedFiles.reduce((sum, file) => sum + file.size, 0)
                  )
                )}
              </span>
            </div>
          </div>
          <div className="size__progress">
            <div className="progress__track">
              <div
                className="progress__fill"
                style={{
                  width: `${Math.min(
                    100,
                    (uploadedFiles.reduce((sum, file) => sum + file.size, 0) /
                      MAX_TOTAL_SIZE) *
                      100
                  )}%`,
                  backgroundColor:
                    uploadedFiles.reduce((sum, file) => sum + file.size, 0) >
                    MAX_TOTAL_SIZE
                      ? "#ef4444"
                      : "#10b981",
                }}
              ></div>
            </div>
            <span className="progress__text">
              {Math.round(
                (uploadedFiles.reduce((sum, file) => sum + file.size, 0) /
                  MAX_TOTAL_SIZE) *
                  100
              )}
              %
            </span>
          </div>
        </div>
      )}

      <div className="uploads__content">
        <div className="uploads__list">
          <h4>Uploaded Files ({uploadedFiles.length})</h4>
          {uploadedFiles.length > 0 ? (
            <div className="files__grid">
              {uploadedFiles
                .map((file, index) => {
                  // Handle potential undefined file objects
                  if (!file || !file.name) {
                    return null;
                  }

                  return (
                    <div
                      key={`${file.name}-${index}-${file.size}`}
                      className="file__item"
                    >
                      <div className="file__icon">
                        <i className={getFileIcon(file.name)}></i>
                      </div>
                      <div className="file__info">
                        <span className="file__name">{file.name}</span>
                        <span className="file__size">
                          {file.size
                            ? (file.size / 1024 / 1024).toFixed(2)
                            : "0.00"}{" "}
                          MB
                        </span>
                      </div>
                      <div className="file__progress">
                        <div className="progress__bar">
                          <div
                            className="progress__fill"
                            style={{
                              width: `${uploadProgress[file.name] || 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="progress__text">
                          {Math.round(uploadProgress[file.name] || 100)}%
                        </span>
                      </div>
                      <button
                        className="remove__file__btn"
                        onClick={() => handleRemoveFile(file.name)}
                        title="Remove file"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  );
                })
                .filter(Boolean)}
            </div>
          ) : (
            <div className="uploads__empty">
              <i className="ri-folder-upload-line"></i>
              <span>No files uploaded yet</span>
              <small>Upload files to attach them to your document</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadsGeneratorTab;
