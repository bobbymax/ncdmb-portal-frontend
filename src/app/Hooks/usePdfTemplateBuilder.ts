import { useState, useCallback } from "react";
import { PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";

// Core interfaces
export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface PDFStyling {
  fonts: FontConfig;
  colors: ColorConfig;
  spacing: SpacingConfig;
  borders: BorderConfig;
  backgrounds: BackgroundConfig;
}

export interface FontConfig {
  primary: string;
  secondary: string;
  sizes: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
}

export interface ColorConfig {
  primary: string;
  secondary: string;
  text: string;
  background: string;
  border: string;
}

export interface SpacingConfig {
  margin: number;
  padding: number;
  lineHeight: number;
  paragraphSpacing: number;
}

export interface BorderConfig {
  width: number;
  color: string;
  radius: number;
}

export interface BackgroundConfig {
  color: string;
  opacity: number;
}

export interface ComponentData {
  id: string;
  type: string;
  data: any;
  position?: Position;
  dimensions?: Dimensions;
}

export interface PageConfig {
  width: number;
  height: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// A4 Page Layout Manager
export class A4PageLayout {
  private readonly A4_WIDTH = 595.28;
  private readonly A4_HEIGHT = 841.89;
  private readonly DEFAULT_MARGINS = {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
  };

  calculateContentArea(margins = this.DEFAULT_MARGINS): Dimensions {
    return {
      width: this.A4_WIDTH - margins.left - margins.right,
      height: this.A4_HEIGHT - margins.top - margins.bottom,
    };
  }

  fitComponent(
    component: ComponentData,
    currentY: number,
    margins = this.DEFAULT_MARGINS
  ): Position {
    const contentArea = this.calculateContentArea(margins);

    return {
      x: margins.left + (component.position?.x || 0),
      y:
        this.A4_HEIGHT -
        margins.top -
        currentY -
        (component.dimensions?.height || 0),
    };
  }

  checkPageBreak(
    component: ComponentData,
    currentY: number,
    margins = this.DEFAULT_MARGINS
  ): boolean {
    const contentArea = this.calculateContentArea(margins);
    const componentHeight = component.dimensions?.height || 0;

    return currentY + componentHeight > contentArea.height;
  }

  getPageDimensions(): Dimensions {
    return {
      width: this.A4_WIDTH,
      height: this.A4_HEIGHT,
    };
  }
}

// Base PDF Layout Component
export abstract class BasePDFLayout {
  protected styling: PDFStyling;

  constructor(styling: PDFStyling) {
    this.styling = styling;
  }

  abstract render(page: PDFPage, data: any, position: Position): void;
  abstract calculateDimensions(data: any): Dimensions;

  protected parseColor(color: string) {
    // Convert hex/rgb to pdf-lib rgb format
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      return rgb(r, g, b);
    }
    return rgb(0, 0, 0); // Default to black
  }

  protected wrapText(
    text: string,
    maxWidth: number,
    fontSize: number = 12
  ): string[] {
    // Simple text wrapping - can be enhanced with proper font metrics
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const testWidth = testLine.length * fontSize * 0.6; // Rough estimation

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}

// PDF Template Builder Core
export class PDFTemplateBuilder {
  private pdfDoc!: PDFDocument;
  private currentPage!: PDFPage;
  private pageLayout: A4PageLayout;
  private styling: PDFStyling;
  private currentY: number = 0;

  constructor(styling: PDFStyling) {
    this.styling = styling;
    this.pageLayout = new A4PageLayout();
  }

  async createDocument(): Promise<void> {
    this.pdfDoc = await PDFDocument.create();
    await this.addPage();
  }

  async addPage(): Promise<void> {
    const dimensions = this.pageLayout.getPageDimensions();
    this.currentPage = this.pdfDoc.addPage([
      dimensions.width,
      dimensions.height,
    ]);
    this.currentY = 0;
  }

  getCurrentPage(): PDFPage {
    return this.currentPage;
  }

  getPageLayout(): A4PageLayout {
    return this.pageLayout;
  }

  getCurrentY(): number {
    return this.currentY;
  }

  setCurrentY(y: number): void {
    this.currentY = y;
  }

  async generatePDF(): Promise<Blob> {
    const pdfBytes = await this.pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  }

  getStyling(): PDFStyling {
    return this.styling;
  }
}

// Theme Engine
export class PDFThemeEngine {
  static getLightTheme(): PDFStyling {
    return {
      fonts: {
        primary: StandardFonts.Helvetica,
        secondary: StandardFonts.HelveticaBold,
        sizes: {
          small: 10,
          medium: 12,
          large: 14,
          xlarge: 16,
        },
      },
      colors: {
        primary: "#10b981",
        secondary: "#059669",
        text: "#1f2937",
        background: "#ffffff",
        border: "#e5e7eb",
      },
      spacing: {
        margin: 20,
        padding: 16,
        lineHeight: 1.4,
        paragraphSpacing: 8,
      },
      borders: {
        width: 1,
        color: "#e5e7eb",
        radius: 4,
      },
      backgrounds: {
        color: "#ffffff",
        opacity: 1,
      },
    };
  }

  static getDarkTheme(): PDFStyling {
    return {
      fonts: {
        primary: StandardFonts.Helvetica,
        secondary: StandardFonts.HelveticaBold,
        sizes: {
          small: 10,
          medium: 12,
          large: 14,
          xlarge: 16,
        },
      },
      colors: {
        primary: "#10b981",
        secondary: "#059669",
        text: "#f9fafb",
        background: "#1f2937",
        border: "#374151",
      },
      spacing: {
        margin: 20,
        padding: 16,
        lineHeight: 1.4,
        paragraphSpacing: 8,
      },
      borders: {
        width: 1,
        color: "#374151",
        radius: 4,
      },
      backgrounds: {
        color: "#1f2937",
        opacity: 1,
      },
    };
  }
}

// Helper function to map ContentBlock types to PDF mapper types
function mapContentBlockTypeToPdfMapper(contentBlockType: string): string {
  const typeMapping: Record<string, string> = {
    text: "TextBlock",
    paragraph: "TextBlock",
    title: "HeaderBlock",
    paper_title: "HeaderBlock",
    header: "HeaderBlock",
    signature: "SignatureBlock",
    table: "TableBlock",
    list: "TextBlock", // Treat lists as text for now
    expense: "TextBlock",
    invoice: "TextBlock",
    requisition: "TextBlock",
  };

  return typeMapping[contentBlockType] || "TextBlock"; // Default to TextBlock
}

// Helper function to extract data from ContentBlock structure
function extractBlockData(block: any): any {
  const { type, block: blockData, content, state } = block;

  // Extract data based on block type
  switch (type) {
    case "text":
    case "paragraph":
    case "list":
      return {
        content: blockData?.title || blockData?.content || "No content",
        fontSize: 12,
        color: "#000000",
        alignment: "left",
      };

    case "title":
    case "paper_title":
    case "header":
      return {
        title: blockData?.title || "Untitled",
        subtitle: blockData?.subtitle || "",
        date: new Date().toLocaleDateString(),
      };

    case "signature":
      return {
        name: blockData?.title || "Signature",
        title: blockData?.subtitle || "",
        showBox: true,
      };

    case "table":
      return {
        headers: blockData?.headers || ["Column 1", "Column 2"],
        rows: blockData?.rows || [["Data 1", "Data 2"]],
        showBorders: true,
      };

    case "expense":
    case "invoice":
    case "requisition":
      return {
        content: `${blockData?.title || type.toUpperCase()}: ${
          blockData?.content || "No details available"
        }`,
        fontSize: 12,
        color: "#000000",
        alignment: "left",
      };

    default:
      return {
        content: blockData?.title || `Unknown block type: ${type}`,
        fontSize: 12,
        color: "#000000",
        alignment: "left",
      };
  }
}

// Component Registry - will be populated by component mappers
export const ComponentPDFMappers: Record<
  string,
  new (styling: PDFStyling) => BasePDFLayout
> = {};

// Main Hook
export const usePdfTemplateBuilder = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = useCallback(
    async (documentState: any, theme: "light" | "dark" = "light") => {
      setIsGenerating(true);
      setError(null);

      try {
        const styling =
          theme === "dark"
            ? PDFThemeEngine.getDarkTheme()
            : PDFThemeEngine.getLightTheme();
        const builder = new PDFTemplateBuilder(styling);

        await builder.createDocument();

        // Process document components
        if (documentState?.body) {
          console.log("Processing document body:", documentState.body);

          for (const block of documentState.body) {
            console.log("Processing block:", block);

            // Map the ContentBlock type to our PDF mapper types
            const mapperType = mapContentBlockTypeToPdfMapper(block.type);
            const MapperClass = ComponentPDFMappers[mapperType];

            if (MapperClass) {
              console.log(`Found mapper for ${block.type} -> ${mapperType}`);
              const mapper = new MapperClass(styling);

              // Extract data from the ContentBlock structure
              const blockData = extractBlockData(block);
              console.log("Extracted block data:", blockData);

              const dimensions = mapper.calculateDimensions(blockData);

              // Check for page break
              if (
                builder
                  .getPageLayout()
                  .checkPageBreak(
                    { ...block, dimensions },
                    builder.getCurrentY()
                  )
              ) {
                await builder.addPage();
              }

              const position = builder
                .getPageLayout()
                .fitComponent({ ...block, dimensions }, builder.getCurrentY());
              mapper.render(builder.getCurrentPage(), blockData, position);

              builder.setCurrentY(
                builder.getCurrentY() +
                  dimensions.height +
                  styling.spacing.paragraphSpacing
              );
            } else {
              console.log(`No mapper found for block type: ${block.type}`);
            }
          }
        } else {
          console.log("No document body found in state:", documentState);
        }

        const pdfBlob = await builder.generatePDF();
        const url = URL.createObjectURL(pdfBlob);

        return url;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to generate PDF";
        setError(errorMessage);
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
