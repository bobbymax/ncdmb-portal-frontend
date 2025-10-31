import { InboundResponseData } from "app/Repositories/Inbound/data";
import { FormPageComponentProps } from "bootstrap";
import React, { useCallback, useState } from "react";
import TextInput from "../components/forms/TextInput";
import Select from "../components/forms/Select";
import { useDropzone } from "react-dropzone";

const Inbound: React.FC<FormPageComponentProps<InboundResponseData>> = ({
  state,
  setState,
  handleChange,
  loading,
  validationErrors,
}) => {
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; size: number }>
  >([]);

  // Priority options
  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  // Security class options
  const securityClassOptions = [
    { value: "public", label: "Public" },
    { value: "internal", label: "Internal" },
    { value: "confidential", label: "Confidential" },
    { value: "secret", label: "Secret" },
  ];

  // Convert file to data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploadError("");

      // Validate file types
      const invalidFiles = acceptedFiles.filter(
        (file) => file.type !== "application/pdf"
      );

      if (invalidFiles.length > 0) {
        setUploadError("Only PDF files are allowed");
        return;
      }

      try {
        // Convert all files to data URLs
        const dataUrlPromises = acceptedFiles.map((file) =>
          fileToDataURL(file)
        );
        const dataUrls = await Promise.all(dataUrlPromises);

        // Update state with new data URLs
        if (setState) {
          setState((prev) => ({
            ...prev,
            file_uploads: [...(prev.file_uploads || []), ...dataUrls],
          }));
        }

        // Track uploaded file info for display
        const fileInfo = acceptedFiles.map((file) => ({
          name: file.name,
          size: file.size,
        }));
        setUploadedFiles((prev) => [...prev, ...fileInfo]);
      } catch (error) {
        setUploadError("Error converting files. Please try again.");
        console.error("File conversion error:", error);
      }
    },
    [setState]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  // Remove uploaded file
  const handleRemoveFile = (index: number) => {
    if (setState) {
      setState((prev) => ({
        ...prev,
        file_uploads: prev.file_uploads.filter((_, i) => i !== index),
      }));
    }
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Validation Errors */}
      {validationErrors && validationErrors.length > 0 && (
        <div className="col-md-12 mb-5">
          <div
            style={{
              padding: "20px",
              backgroundColor: "#fef2f2",
              borderRadius: "12px",
              border: "2px solid #fecaca",
              boxShadow: "0 4px 6px rgba(220, 38, 38, 0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className="ri-error-warning-fill"
                  style={{ color: "white", fontSize: "18px" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: "#dc2626",
                    fontWeight: 600,
                    fontSize: "16px",
                  }}
                >
                  Please fix the following errors:
                </p>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {validationErrors.map((error, index) => (
                    <li
                      key={index}
                      style={{
                        color: "#991b1b",
                        fontSize: "14px",
                        marginBottom: "6px",
                        lineHeight: "1.5",
                      }}
                    >
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Sender Information Card */}
      <div className="col-md-12 mb-4">
        <div className="custom-card">
          <div className="custom-card-header mb-4">
            <div className="flex align gap-sm">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 6px rgba(5, 150, 105, 0.2)",
                }}
              >
                <i
                  className="ri-user-line"
                  style={{ fontSize: "20px", color: "white" }}
                />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#1f2937",
                  }}
                >
                  Sender Information
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  Enter details about the document sender
                </p>
              </div>
            </div>
          </div>
          <div className="custom-card-body">
            <div className="row">
              <div className="col-md-4 mb-3">
                <TextInput
                  label="Company Name"
                  name="from_name"
                  value={state.from_name}
                  onChange={handleChange}
                  placeholder="Enter sender's full name"
                  isDisabled={loading}
                />
              </div>

              <div className="col-md-4 mb-3">
                <TextInput
                  label="Company Email"
                  name="from_email"
                  type="email"
                  value={state.from_email}
                  onChange={handleChange}
                  placeholder="sender@example.com"
                  isDisabled={loading}
                />
              </div>

              <div className="col-md-4 mb-3">
                <TextInput
                  label="Company Phone"
                  name="from_phone"
                  type="text"
                  value={state.from_phone}
                  onChange={handleChange}
                  placeholder="+234 XXX XXX XXXX"
                  isDisabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Classification Card */}
      <div className="col-md-12 mb-4">
        <div className="custom-card">
          <div className="custom-card-header mb-4">
            <div className="flex align gap-sm">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 6px rgba(59, 130, 246, 0.2)",
                }}
              >
                <i
                  className="ri-shield-check-line"
                  style={{ fontSize: "20px", color: "white" }}
                />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#1f2937",
                  }}
                >
                  Document Classification
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  Set priority and security level for this document
                </p>
              </div>
            </div>
          </div>
          <div className="custom-card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <div
                  style={{
                    padding: "15px",
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Select
                    label="Priority Level"
                    name="priority"
                    value={state.priority}
                    onChange={handleChange}
                    defaultValue=""
                    defaultText="Select priority level"
                    valueKey="value"
                    labelKey="label"
                    options={priorityOptions}
                    isDisabled={loading}
                  />
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <i
                      className="ri-information-line"
                      style={{ color: "#6b7280", fontSize: "14px" }}
                    />
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Higher priority documents are processed faster
                    </span>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <div
                  style={{
                    padding: "15px",
                    borderRadius: "8px",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Select
                    label="Security Classification"
                    name="security_class"
                    value={state.security_class}
                    onChange={handleChange}
                    defaultValue=""
                    defaultText="Select security level"
                    valueKey="value"
                    labelKey="label"
                    options={securityClassOptions}
                    isDisabled={loading}
                  />
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <i
                      className="ri-lock-line"
                      style={{ color: "#6b7280", fontSize: "14px" }}
                    />
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Determines who can access this document
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Card */}
      <div className="col-md-12 mb-4">
        <div className="custom-card">
          <div className="custom-card-header mb-4">
            <div className="flex align gap-sm">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 6px rgba(220, 38, 38, 0.2)",
                }}
              >
                <i
                  className="ri-upload-cloud-2-line"
                  style={{ fontSize: "20px", color: "white" }}
                />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#1f2937",
                  }}
                >
                  Document Upload
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  Upload PDF documents (multiple files supported)
                </p>
              </div>
            </div>
          </div>
          <div className="custom-card-body">
            <div
              {...getRootProps()}
              style={{
                border: isDragActive
                  ? "3px dashed #059669"
                  : "2px dashed #d1d5db",
                padding: "40px 20px",
                cursor: "pointer",
                textAlign: "center",
                borderRadius: "12px",
                backgroundColor: isDragActive
                  ? "rgba(5, 150, 105, 0.05)"
                  : "white",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <input {...getInputProps()} />

              {/* Background decoration */}
              <div
                style={{
                  position: "absolute",
                  top: "-50px",
                  right: "-50px",
                  width: "150px",
                  height: "150px",
                  borderRadius: "50%",
                  background: "rgba(5, 150, 105, 0.05)",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  left: "-30px",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "rgba(220, 38, 38, 0.05)",
                  zIndex: 0,
                }}
              />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    margin: "0 auto 20px",
                    borderRadius: "50%",
                    background: isDragActive
                      ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                      : "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    boxShadow: isDragActive
                      ? "0 10px 25px rgba(5, 150, 105, 0.3)"
                      : "none",
                  }}
                >
                  <i
                    className="ri-file-pdf-line"
                    style={{
                      fontSize: "40px",
                      color: isDragActive ? "white" : "#059669",
                      transition: "all 0.3s ease",
                    }}
                  />
                </div>

                <h4
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  {isDragActive
                    ? "Drop PDF files here..."
                    : "Drop files or click to browse"}
                </h4>

                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "16px",
                  }}
                >
                  Only PDF files are accepted • No size limit
                </p>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#f3f4f6",
                    fontSize: "13px",
                    color: "#4b5563",
                  }}
                >
                  <i className="ri-shield-check-line" />
                  Secure Upload
                </div>
              </div>
            </div>

            {uploadError && (
              <div
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  backgroundColor: "#fef2f2",
                  borderRadius: "8px",
                  border: "1px solid #fecaca",
                  display: "flex",
                  alignItems: "start",
                  gap: "12px",
                }}
              >
                <i
                  className="ri-error-warning-fill"
                  style={{
                    color: "#dc2626",
                    fontSize: "20px",
                    marginTop: "2px",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 500,
                      color: "#dc2626",
                      fontSize: "14px",
                    }}
                  >
                    Upload Error
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#991b1b",
                      fontSize: "13px",
                    }}
                  >
                    {uploadError}
                  </p>
                </div>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    <i
                      className="ri-file-list-3-line"
                      style={{ marginRight: "8px" }}
                    />
                    Uploaded Files ({uploadedFiles.length})
                  </p>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#6b7280",
                      fontWeight: 500,
                    }}
                  >
                    Total:{" "}
                    {(
                      uploadedFiles.reduce((acc, f) => acc + f.size, 0) / 1024
                    ).toFixed(2)}{" "}
                    KB
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 6px rgba(0, 0, 0, 0.1)";
                        e.currentTarget.style.borderColor = "#059669";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 1px 3px rgba(0, 0, 0, 0.05)";
                        e.currentTarget.style.borderColor = "#e5e7eb";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <i
                            className="ri-file-pdf-fill"
                            style={{ fontSize: "24px", color: "white" }}
                          />
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              margin: 0,
                              color: "#1f2937",
                              maxWidth: "400px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              marginTop: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <i
                                className="ri-file-line"
                                style={{ fontSize: "14px" }}
                              />
                              {(file.size / 1024).toFixed(2)} KB
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                backgroundColor: "#dcfce7",
                                color: "#166534",
                                fontWeight: 500,
                              }}
                            >
                              <i
                                className="ri-check-line"
                                style={{ fontSize: "12px" }}
                              />{" "}
                              Uploaded
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "6px",
                          background: "transparent",
                          border: "1px solid #e5e7eb",
                          cursor: "pointer",
                          color: "#6b7280",
                          fontSize: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#fee2e2";
                          e.currentTarget.style.borderColor = "#dc2626";
                          e.currentTarget.style.color = "#dc2626";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = "#e5e7eb";
                          e.currentTarget.style.color = "#6b7280";
                        }}
                        title="Remove file"
                      >
                        <i className="ri-delete-bin-line" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Inbound;
