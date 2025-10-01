import React, { useState, useCallback } from "react";
import { pdf } from "@react-pdf/renderer";

// React PDF Components
export interface ReactPdfDocumentProps {
  documentState: any;
  theme: "light" | "dark";
}

export interface ReactPdfComponentProps {
  data: any;
  theme: "light" | "dark";
}

// Theme-aware styling
export const getThemeStyles = (theme: "light" | "dark") => {
  const baseColors = {
    light: {
      primary: "#10b981",
      secondary: "#059669",
      text: "#1f2937",
      background: "#ffffff",
      border: "#e5e7eb",
      gray: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
      },
    },
    dark: {
      primary: "#10b981",
      secondary: "#059669",
      text: "#f9fafb",
      background: "#1f2937",
      border: "#374151",
      gray: {
        50: "#111827",
        100: "#1f2937",
        200: "#374151",
        300: "#4b5563",
        400: "#6b7280",
        500: "#9ca3af",
        600: "#d1d5db",
        700: "#e5e7eb",
        800: "#f3f4f6",
        900: "#f9fafb",
      },
    },
  };

  const colors = baseColors[theme];

  return {
    page: {
      padding: 40,
      backgroundColor: colors.background,
      color: colors.text,
      fontFamily: "Helvetica",
    },
    header: {
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold" as const,
      color: colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 5,
    },
    date: {
      fontSize: 12,
      color: colors.gray[500],
    },
    text: {
      fontSize: 12,
      color: colors.text,
      lineHeight: 1.4,
      marginBottom: 8,
    },
    paragraph: {
      fontSize: 12,
      color: colors.text,
      lineHeight: 1.6,
      marginBottom: 12,
    },
    signatureBox: {
      width: 200,
      height: 80,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "solid" as const,
      marginTop: 20,
      padding: 10,
    },
    signatureName: {
      fontSize: 14,
      fontWeight: "bold" as const,
      color: colors.text,
      marginBottom: 5,
    },
    signatureTitle: {
      fontSize: 12,
      color: colors.gray[600],
    },
    table: {
      marginTop: 15,
      marginBottom: 15,
    },
    tableHeader: {
      backgroundColor: colors.gray[100],
      padding: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "solid" as const,
    },
    tableRow: {
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "solid" as const,
      padding: 8,
    },
    tableCell: {
      fontSize: 11,
      color: colors.text,
    },
    footer: {
      position: "absolute" as const,
      bottom: 30,
      left: 40,
      right: 40,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      fontSize: 10,
      color: colors.gray[500],
      textAlign: "center" as const,
    },
  };
};

// Component mappers for different content types
export const mapContentBlockToReactPdf = (
  block: any,
  theme: "light" | "dark"
) => {
  const { type, block: blockData } = block;

  switch (type) {
    case "text":
    case "paragraph":
    case "list":
      return {
        type: "text",
        data: {
          content: blockData?.title || blockData?.content || "No content",
          fontSize: 12,
        },
      };

    case "title":
    case "paper_title":
    case "header":
      return {
        type: "header",
        data: {
          title: blockData?.title || "Untitled",
          subtitle: blockData?.subtitle || "",
          date: new Date().toLocaleDateString(),
        },
      };

    case "signature":
      return {
        type: "signature",
        data: {
          name: blockData?.title || "Signature",
          title: blockData?.subtitle || "",
        },
      };

    case "table":
      return {
        type: "table",
        data: {
          headers: blockData?.headers || ["Column 1", "Column 2"],
          rows: blockData?.rows || [["Data 1", "Data 2"]],
        },
      };

    case "expense":
    case "invoice":
    case "requisition":
      return {
        type: "text",
        data: {
          content: `${blockData?.title || type.toUpperCase()}: ${
            blockData?.content || "No details available"
          }`,
          fontSize: 12,
        },
      };

    default:
      return {
        type: "text",
        data: {
          content: blockData?.title || `Unknown block type: ${type}`,
          fontSize: 12,
        },
      };
  }
};

// Main Hook
export const useReactPdfBuilder = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = useCallback(
    async (documentState: any, theme: "light" | "dark" = "light") => {
      setIsGenerating(true);
      setError(null);

      try {
        console.log("Generating PDF with @react-pdf/renderer:", documentState);

        // Import the PDF Document component dynamically to avoid SSR issues
        const ReactPdfDocument = (
          await import("../components/ReactPdfDocument")
        ).default;

        // Create the PDF document using JSX
        const pdfBlob = await pdf(
          <ReactPdfDocument documentState={documentState} theme={theme} />
        ).toBlob();

        // Create URL for the blob
        const url = URL.createObjectURL(pdfBlob);

        console.log("PDF generated successfully with @react-pdf/renderer");
        return url;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate PDF";
        setError(errorMessage);
        console.error("Error generating PDF with @react-pdf/renderer:", err);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    generatePDF,
    isGenerating,
    error,
  };
};
