import React, { useEffect, useState } from "react";
import { ActionComponentProps } from "../../modals/DocumentUpdateModal";
import { UploadResponseData } from "app/Repositories/Document/data";
import DocumentRepository from "app/Repositories/Document/DocumentRepository";
import TextInput from "resources/views/components/forms/TextInput";
import { useStateContext } from "app/Context/ContentContext";
import Button from "resources/views/components/forms/Button";
import { useAuth } from "app/Context/AuthContext";

const MAX_FILE_SIZE_MB = 3;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
];

interface UploadPreview {
  name: string;
  size: number;
  type: string;
  base64: string;
}

const UploadDraftActionComponent: React.FC<
  ActionComponentProps<UploadResponseData, DocumentRepository>
> = ({
  action,
  service,
  getModalState,
  currentDraft,
  updateModalState,
  handleFormSubmit,
}) => {
  const { isLoading } = useStateContext();
  const { staff } = useAuth();
  const state: UploadResponseData = getModalState(service);

  const [filePreview, setFilePreview] = useState<UploadPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset
    setError(null);
    setFilePreview(null);

    // Validation
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(`Unsupported file type: ${file.type}`);
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFilePreview({
        name: file.name,
        size: file.size,
        type: file.type,
        base64,
      });
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (filePreview && staff && currentDraft) {
      const extension = filePreview.name.split(".").pop()?.toLowerCase() || "";
      updateModalState(service, {
        ...state,
        user_id: staff.id,
        department_id: staff.department_id,
        name: filePreview.name,
        path: filePreview.name,
        file_path: filePreview.base64,
        size: filePreview.size,
        mime_type: filePreview.type,
        extension,
        uploadable_id: currentDraft.id,
        uploadable_type: "DocumentDraft",
      });
    }
  }, [filePreview, staff, currentDraft]);

  return (
    <form onSubmit={handleFormSubmit} encType="multipart/form-data">
      <div className="row">
        <div className="col-md-10 mb-3">
          <TextInput
            label="Upload Document"
            onChange={handleFileUpload}
            type="file"
            name="file_path"
            size="sm"
          />
        </div>
        <div className="col-md-2" style={{ marginTop: 25 }}>
          <Button
            label="Upload File"
            type="submit"
            icon={action.icon}
            size="sm"
            variant="dark"
            isDisabled={!filePreview || state.user_id < 1 || isLoading}
          />
        </div>
        <div className="col-md-12 mt-3">
          {filePreview && (
            <div
              className="file__preview__board"
              style={{
                height: filePreview ? 500 : 0,
                overflow: "auto",
              }}
            >
              {filePreview.type.startsWith("image/") ? (
                <img
                  src={filePreview.base64}
                  style={{
                    width: "100%",
                  }}
                  alt="Preview"
                  className="max-w-sm border rounded shadow mt-2"
                />
              ) : filePreview.type === "application/pdf" ? (
                <iframe
                  src={filePreview.base64}
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  title="PDF Preview"
                  className="w-full h-96 mt-2 border rounded"
                />
              ) : (
                <p className="text-gray-600 text-sm mt-2">
                  Preview not available for this file type.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="col-md-12 mb-3">
          {error && <p className="text-danger">{error}</p>}
        </div>
      </div>
    </form>
  );
};

export default UploadDraftActionComponent;
