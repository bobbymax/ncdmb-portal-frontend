import {
  BaseRepository,
  TabOptionProps,
  ViewsProps,
} from "app/Repositories/BaseRepository";
import { UploadResponseData } from "app/Repositories/Document/data";
import { PDFDocument } from "pdf-lib";
import { useEffect, useState } from "react";

interface FileActionProps<T extends BaseRepository> {
  Repo: T;
  uploads: UploadResponseData[];
  tab?: TabOptionProps;
}

const useFileActions = ({
  Repo,
  uploads,
  tab,
}: FileActionProps<BaseRepository>) => {
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const fetchSecureFile = async (id: number): Promise<Uint8Array | null> => {
    try {
      const response = await Repo.show("uploads", id);

      const data = response.data as UploadResponseData;

      const base64 = data.file_path.split(",")[1];
      const binary = atob(base64);

      const byteArray = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        byteArray[i] = binary.charCodeAt(i);
      }

      return byteArray;
    } catch (error) {
      // Failed to fetch or decode file
      return null;
    }
  };

  const mergeSecureFilesToPDF = async (
    uploads: UploadResponseData[]
  ): Promise<string> => {
    const mergedPdf = await PDFDocument.create();

    for (const upload of uploads) {
      const fileBytes = await fetchSecureFile(upload.id);

      if (!fileBytes) continue;

      if (upload.mime_type === "application/pdf") {
        const pdfDoc = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } else if (upload.mime_type.startsWith("image/")) {
        let image;
        if (upload.mime_type === "image/jpeg") {
          image = await mergedPdf.embedJpg(fileBytes);
        } else if (upload.mime_type === "image/png") {
          image = await mergedPdf.embedPng(fileBytes);
        }

        if (image) {
          const page = mergedPdf.addPage();
          const { width, height } = image.scale(1);
          page.setWidth(width);
          page.setHeight(height);
          page.drawImage(image, { x: 0, y: 0, width, height });
        }
      }
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    if (uploads.length > 0) {
      const merge = async () => {
        const url = await mergeSecureFilesToPDF(uploads);
        setMergedPdfUrl(url);
      };

      merge();
    }
  }, [uploads]);

  return { mergedPdfUrl };
};

export default useFileActions;
