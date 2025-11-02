import * as pdfjsLib from "pdfjs-dist";

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text content from a single PDF data URL
 */
export const extractTextFromPdf = async (dataUrl: string): Promise<string> => {
  try {
    console.log("📄 Starting PDF text extraction...");
    console.log("Data URL length:", dataUrl.length);
    console.log("Data URL preview:", dataUrl.substring(0, 100));

    // Convert data URL to array buffer
    const response = await fetch(dataUrl);
    console.log("Fetch response status:", response.status);
    console.log("Fetch response type:", response.type);

    const arrayBuffer = await response.arrayBuffer();
    console.log("Array buffer size:", arrayBuffer.byteLength);

    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log("PDF loaded successfully!");
    console.log("Number of pages:", pdf.numPages);

    let fullText = "";

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Extracting page ${i}/${pdf.numPages}...`);

      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      console.log(`Page ${i} has ${textContent.items.length} text items`);

      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      console.log(`Page ${i} extracted text length: ${pageText.length}`);

      fullText += `\n--- Page ${i} ---\n${pageText}\n`;
    }

    console.log("✅ Total extracted text length:", fullText.trim().length);
    return fullText.trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

/**
 * Extract text from multiple PDF uploads
 */
export const extractTextFromMultiplePdfs = async (
  uploads: Array<{ file_path: string; name?: string }>
): Promise<string> => {
  try {
    const textPromises = uploads
      .filter((upload) => {
        const path = upload.file_path;
        // console.log(path);
        return (
          path?.startsWith("data:application/pdf") ||
          path?.endsWith(".pdf") ||
          path?.includes("/storage/") ||
          path?.includes("pdf")
        );
      })
      .map(async (upload, index) => {
        try {
          // For regular URLs, we need to fetch and convert first
          let pdfDataUrl = upload.file_path;

          // If it's not a data URL, fetch it and convert
          if (!pdfDataUrl.startsWith("data:")) {
            console.log(`Fetching PDF from URL: ${pdfDataUrl}`);
            const response = await fetch(pdfDataUrl);
            const blob = await response.blob();

            // Convert blob to data URL
            pdfDataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }

          const text = await extractTextFromPdf(pdfDataUrl);
          return `\n========== Document ${index + 1}: ${
            upload.name || "Untitled"
          } ==========\n${text}`;
        } catch (err) {
          console.error(`❌ Failed to extract text from ${upload.name}:`, err);
          return `\n========== Document ${index + 1}: ${
            upload.name || "Untitled"
          } ==========\n[Text extraction failed]`;
        }
      });

    const texts = await Promise.all(textPromises);
    const result = texts.join("\n\n");

    console.log(
      `Extracted ${result.length} characters of text from ${uploads.length} PDFs`
    );
    return result;
  } catch (error) {
    console.error("Error extracting text from multiple PDFs:", error);
    throw new Error("Failed to extract text from PDFs");
  }
};

/**
 * Check if a PDF has extractable text (not scanned image)
 */
export const hasExtractableText = async (dataUrl: string): Promise<boolean> => {
  try {
    const text = await extractTextFromPdf(dataUrl);
    return text.trim().length > 50; // Arbitrary threshold
  } catch {
    return false;
  }
};
