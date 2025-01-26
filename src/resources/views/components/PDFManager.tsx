import React, { useState } from "react";
import SignaturePad from "./SignaturePad";
import PDFViewer from "./PDFViewer";
import { addSignatureToPDF, mergePDFs } from "app/Support/DocumentReader";

const PDFManager: React.FC<{ uploadedFiles: string[] }> = ({
  uploadedFiles,
}) => {
  const [mergedPdfBlob, setMergedPdfBlob] = useState<Blob | null>(null);

  const handleMerge = async () => {
    const mergedBlob = await mergePDFs(uploadedFiles);
    setMergedPdfBlob(mergedBlob);
  };

  const handleAddSignature = async (signatureDataUrl: string) => {
    if (!mergedPdfBlob) return;

    const updatedBlob = await addSignatureToPDF(
      await mergedPdfBlob.arrayBuffer(),
      signatureDataUrl
    );
    setMergedPdfBlob(updatedBlob);
  };

  return (
    <div>
      <button onClick={handleMerge}>Merge PDFs</button>
      {mergedPdfBlob && (
        <>
          <SignaturePad onSave={handleAddSignature} />
          {/* <button onClick={handleAddChart}>Add Chart</button> */}
          <PDFViewer fileUrl={URL.createObjectURL(mergedPdfBlob)} />
        </>
      )}
    </div>
  );
};

export default PDFManager;
