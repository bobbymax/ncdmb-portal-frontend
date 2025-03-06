import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

export const mergePDFs = async (fileUrls: string[]): Promise<Blob> => {
  const mergedPdf = await PDFDocument.create();

  for (const fileUrl of fileUrls) {
    const existingPdfBytes = await fetch(fileUrl).then((res) =>
      res.arrayBuffer()
    );

    try {
      const pdf = await PDFDocument.load(existingPdfBytes, {
        ignoreEncryption: true,
      });

      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (error) {
      continue;
    }
  }

  const mergedPdfBytes = await mergedPdf.save();
  return new Blob([mergedPdfBytes], { type: "application/pdf" });
};

export const downloadMergedPDF = async (fileUrls: string[]) => {
  const mergedBlob = await mergePDFs(fileUrls);
  saveAs(mergedBlob, "merged-document.pdf");
};

export const addSignatureToPDF = async (
  pdfBytes: ArrayBuffer,
  signatureDataUrl: string,
  pageIndex: number = 0
): Promise<Blob> => {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const signatureImageBytes = await fetch(signatureDataUrl).then((res) =>
    res.arrayBuffer()
  );

  const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
  const page = pdfDoc.getPage(pageIndex);

  page.drawImage(signatureImage, {
    x: 100,
    y: 100,
    width: 200,
    height: 100,
  });

  const updatedPdfBytes = await pdfDoc.save();
  return new Blob([updatedPdfBytes], { type: "application/pdf" });
};
