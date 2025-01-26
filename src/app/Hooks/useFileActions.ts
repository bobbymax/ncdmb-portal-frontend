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
  View: ViewsProps;
  uploads: UploadResponseData[];
  tab?: TabOptionProps;
}

const useFileActions = ({
  Repo,
  View,
  uploads,
  tab,
}: FileActionProps<BaseRepository>) => {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const getFileFullPaths = (uploads: UploadResponseData[]): string[] => {
    return uploads.map((upload) => upload.path);
  };

  // Function to merge files into a single PDF
  const mergeFilesToPDF = async (files: File[]): Promise<string> => {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();

      if (file.type === "application/pdf") {
        const pdfToMerge = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(
          pdfToMerge,
          pdfToMerge.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } else if (file.type.startsWith("image/")) {
        const imageBuffer = new Uint8Array(arrayBuffer);
        const page = mergedPdf.addPage();

        let image;
        if (file.type === "image/jpeg") {
          image = await mergedPdf.embedJpg(imageBuffer);
        } else if (file.type === "image/png") {
          image = await mergedPdf.embedPng(imageBuffer);
        }

        if (image) {
          const { width, height } = image.scale(1);
          page.setWidth(width);
          page.setHeight(height);
          page.drawImage(image, { x: 0, y: 0, width, height });
        }
      }
    }

    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    // setMergedPdfUrl(URL.createObjectURL(blob)); // Return the Blob URL
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    if (uploads.length > 0) {
      const fullPaths = getFileFullPaths(uploads);

      const getUploadedFiles = async () => {
        const fetchedFiles = await Repo.getFiles(fullPaths);

        setFiles(fetchedFiles);
      };

      getUploadedFiles();
    }
  }, [Repo, uploads]);

  useEffect(() => {
    if (files.length > 0) {
      const getMergedUrl = async () => {
        const url = await mergeFilesToPDF(files);

        setMergedPdfUrl(url);
      };

      getMergedUrl();
    }
  }, [files]);

  return { mergedPdfUrl };
};

export default useFileActions;
