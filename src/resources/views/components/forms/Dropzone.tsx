import React from "react";
import { useDropzone } from "react-dropzone";

type DropzoneProps = {
  label: string;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
};

const Dropzone: React.FC<DropzoneProps> = ({ label, files, setFiles }) => {
  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    multiple: true,
  });

  return (
    <div>
      <p className="storm-form-label mb-2">{label}</p>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          cursor: "pointer",
          textAlign: "center",
        }}
      >
        <input {...getInputProps()} />
        <p>Drag and drop files here, or click to select files</p>
      </div>

      {/* <ul>
        {files.map((file, index) => (
          <li key={index}>
            {file.name} - {Math.round(file.size / 1024)} KB
          </li>
        ))}
      </ul> */}
    </div>
  );
};

export default Dropzone;
