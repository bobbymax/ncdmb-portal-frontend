import { Viewer, Worker } from "@react-pdf-viewer/core";
import React from "react";
import * as pdfjsLib from "pdfjs-dist";

interface PDFViewerProps {
  fileUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  return (
    <div style={{ height: "100vh" }}>
      <Worker
        workerUrl={`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`}
      >
        <Viewer fileUrl={fileUrl} />
      </Worker>
    </div>
  );
};

export default PDFViewer;
