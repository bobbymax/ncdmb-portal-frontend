import React, { useEffect, useState } from "react";
import { PDFDocument, rgb } from "pdf-lib"; // Library for PDF creation/merging
import axios from "axios";
import { fetchFilesFromUrls } from "app/Support/Helpers";

const MergeFiles: React.FC = () => {
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  // Fetch uploaded files (URLs from the backend)
  const fetchFiles = async (): Promise<string[]> => {
    const response = await axios.get("");

    console.log(response.data.files);

    return response.data.files; // Assume the API returns an array of file URLs
  };

  const mergeFiles = async (fileUrls: string[]) => {
    const pdfDoc = await PDFDocument.create();

    for (const url of fileUrls) {
      const fileResponse = await axios.get(url, {
        responseType: "arraybuffer",
      });
      const fileData = new Uint8Array(fileResponse.data);

      if (url.endsWith(".pdf")) {
        // Merge PDF pages
        const pdfToMerge = await PDFDocument.load(fileData);
        const copiedPages = await pdfDoc.copyPages(
          pdfToMerge,
          pdfToMerge.getPageIndices()
        );
        copiedPages.forEach((page) => pdfDoc.addPage(page));
      } else if (
        url.endsWith(".jpeg") ||
        url.endsWith(".jpg") ||
        url.endsWith(".png")
      ) {
        // Add images as pages
        const image = url.endsWith(".png")
          ? await pdfDoc.embedPng(fileData)
          : await pdfDoc.embedJpg(fileData);

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    setMergedPdfUrl(pdfUrl); // Update state with the URL of the merged PDF
  };

  useEffect(() => {
    const handleMerge = async () => {
      const fileUrls = await fetchFiles();
      await mergeFiles(fileUrls);
    };

    handleMerge();
  }, []);

  //   console.log(fetchFilesFromUrls());

  return (
    <div>
      <h2>Merged PDF Viewer</h2>
      {mergedPdfUrl ? (
        <iframe
          src={mergedPdfUrl}
          width="100%"
          height="600px"
          title="Merged PDF"
        ></iframe>
      ) : (
        <p>Loading merged PDF...</p>
      )}
      {mergedPdfUrl && (
        <a href={mergedPdfUrl} download="merged.pdf">
          Download Merged PDF
        </a>
      )}
    </div>
  );
};

export default MergeFiles;
