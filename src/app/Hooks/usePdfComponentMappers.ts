import { PDFPage, rgb } from "pdf-lib";
import {
  BasePDFLayout,
  Position,
  Dimensions,
  PDFStyling,
} from "./usePdfTemplateBuilder";

// Text PDF Layout
export class TextPDFLayout extends BasePDFLayout {
  render(page: PDFPage, data: any, position: Position): void {
    const { content, fontSize, color, alignment = "left" } = data;

    if (!content) return;

    const textColor = color
      ? this.parseColor(color)
      : this.parseColor(this.styling.colors.text);
    const textSize = fontSize || this.styling.fonts.sizes.medium;

    // Handle text wrapping
    const maxWidth = 500; // Adjust based on page margins
    const lines = this.wrapText(content, maxWidth, textSize);

    lines.forEach((line, index) => {
      let x = position.x;

      // Handle alignment
      if (alignment === "center") {
        const textWidth = line.length * textSize * 0.6;
        x = position.x + (maxWidth - textWidth) / 2;
      } else if (alignment === "right") {
        const textWidth = line.length * textSize * 0.6;
        x = position.x + maxWidth - textWidth;
      }

      page.drawText(line, {
        x,
        y: position.y - index * textSize * this.styling.spacing.lineHeight,
        size: textSize,
        color: textColor,
      });
    });
  }

  calculateDimensions(data: any): Dimensions {
    const { content, fontSize } = data;
    const textSize = fontSize || this.styling.fonts.sizes.medium;

    if (!content) return { width: 0, height: 0 };

    const maxWidth = 500;
    const lines = this.wrapText(content, maxWidth, textSize);
    const lineHeight = textSize * this.styling.spacing.lineHeight;

    return {
      width: maxWidth,
      height: lines.length * lineHeight,
    };
  }
}

// Signature PDF Layout
export class SignaturePDFLayout extends BasePDFLayout {
  render(page: PDFPage, data: any, position: Position): void {
    const { name, title, showBox = true } = data;

    if (showBox) {
      // Draw signature box
      page.drawRectangle({
        x: position.x,
        y: position.y - 60,
        width: 200,
        height: 80,
        borderColor: this.parseColor(this.styling.colors.border),
        borderWidth: this.styling.borders.width,
      });
    }

    // Add signature text
    if (name) {
      page.drawText(name, {
        x: position.x + 10,
        y: position.y - 20,
        size: this.styling.fonts.sizes.medium,
        color: this.parseColor(this.styling.colors.text),
      });
    }

    if (title) {
      page.drawText(title, {
        x: position.x + 10,
        y: position.y - 40,
        size: this.styling.fonts.sizes.small,
        color: this.parseColor(this.styling.colors.text),
      });
    }
  }

  calculateDimensions(data: any): Dimensions {
    return {
      width: 200,
      height: 80,
    };
  }
}

// Image PDF Layout
export class ImagePDFLayout extends BasePDFLayout {
  async render(page: PDFPage, data: any, position: Position): Promise<void> {
    const { src, alt, width = 200, height = 150 } = data;

    if (!src) return;

    try {
      // Handle different image sources
      let imageBytes: Uint8Array;

      if (src.startsWith("data:")) {
        // Data URL
        const base64 = src.split(",")[1];
        imageBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      } else if (src.startsWith("http")) {
        // URL
        const response = await fetch(src);
        imageBytes = new Uint8Array(await response.arrayBuffer());
      } else {
        // Assume it's a file path or other source
        console.warn("Unsupported image source:", src);
        return;
      }

      // Embed image
      const image = await page.doc.embedPng(imageBytes);

      // Draw image
      page.drawImage(image, {
        x: position.x,
        y: position.y - height,
        width,
        height,
      });

      // Add alt text if provided
      if (alt) {
        page.drawText(alt, {
          x: position.x,
          y: position.y - height - 20,
          size: this.styling.fonts.sizes.small,
          color: this.parseColor(this.styling.colors.text),
        });
      }
    } catch (error) {
      console.error("Error rendering image:", error);
      // Draw placeholder
      page.drawRectangle({
        x: position.x,
        y: position.y - height,
        width,
        height,
        borderColor: this.parseColor(this.styling.colors.border),
        borderWidth: this.styling.borders.width,
      });

      page.drawText("Image not available", {
        x: position.x + 10,
        y: position.y - height / 2,
        size: this.styling.fonts.sizes.small,
        color: this.parseColor(this.styling.colors.text),
      });
    }
  }

  calculateDimensions(data: any): Dimensions {
    const { width = 200, height = 150 } = data;
    return { width, height };
  }
}

// Table PDF Layout
export class TablePDFLayout extends BasePDFLayout {
  render(page: PDFPage, data: any, position: Position): void {
    const { headers, rows, showBorders = true } = data;

    if (!headers || !rows) return;

    const cellWidth = 100;
    const cellHeight = 20;
    const startX = position.x;
    let currentY = position.y;

    // Draw headers
    if (showBorders) {
      page.drawRectangle({
        x: startX,
        y: currentY - cellHeight,
        width: cellWidth * headers.length,
        height: cellHeight,
        borderColor: this.parseColor(this.styling.colors.border),
        borderWidth: this.styling.borders.width,
      });
    }

    headers.forEach((header: string, index: number) => {
      page.drawText(header, {
        x: startX + index * cellWidth + 5,
        y: currentY - 15,
        size: this.styling.fonts.sizes.small,
        color: this.parseColor(this.styling.colors.text),
      });
    });

    currentY -= cellHeight;

    // Draw rows
    rows.forEach((row: string[]) => {
      if (showBorders) {
        page.drawRectangle({
          x: startX,
          y: currentY - cellHeight,
          width: cellWidth * headers.length,
          height: cellHeight,
          borderColor: this.parseColor(this.styling.colors.border),
          borderWidth: this.styling.borders.width,
        });
      }

      row.forEach((cell: string, index: number) => {
        page.drawText(cell, {
          x: startX + index * cellWidth + 5,
          y: currentY - 15,
          size: this.styling.fonts.sizes.small,
          color: this.parseColor(this.styling.colors.text),
        });
      });

      currentY -= cellHeight;
    });
  }

  calculateDimensions(data: any): Dimensions {
    const { headers, rows } = data;
    if (!headers || !rows) return { width: 0, height: 0 };

    const cellWidth = 100;
    const cellHeight = 20;

    return {
      width: cellWidth * headers.length,
      height: cellHeight * (rows.length + 1), // +1 for header
    };
  }
}

// Header PDF Layout
export class HeaderPDFLayout extends BasePDFLayout {
  render(page: PDFPage, data: any, position: Position): void {
    const { title, subtitle, date, logo } = data;

    let currentY = position.y;

    // Draw title
    if (title) {
      page.drawText(title, {
        x: position.x,
        y: currentY,
        size: this.styling.fonts.sizes.xlarge,
        color: this.parseColor(this.styling.colors.primary),
      });
      currentY -= 30;
    }

    // Draw subtitle
    if (subtitle) {
      page.drawText(subtitle, {
        x: position.x,
        y: currentY,
        size: this.styling.fonts.sizes.large,
        color: this.parseColor(this.styling.colors.text),
      });
      currentY -= 25;
    }

    // Draw date
    if (date) {
      page.drawText(date, {
        x: position.x,
        y: currentY,
        size: this.styling.fonts.sizes.medium,
        color: this.parseColor(this.styling.colors.text),
      });
    }
  }

  calculateDimensions(data: any): Dimensions {
    const { title, subtitle, date } = data;
    let height = 0;

    if (title) height += 30;
    if (subtitle) height += 25;
    if (date) height += 20;

    return {
      width: 500,
      height: height || 30,
    };
  }
}

// Footer PDF Layout
export class FooterPDFLayout extends BasePDFLayout {
  render(page: PDFPage, data: any, position: Position): void {
    const { text, pageNumber } = data;

    const currentY = position.y;

    // Draw footer text
    if (text) {
      page.drawText(text, {
        x: position.x,
        y: currentY,
        size: this.styling.fonts.sizes.small,
        color: this.parseColor(this.styling.colors.text),
      });
    }

    // Draw page number
    if (pageNumber) {
      page.drawText(`Page ${pageNumber}`, {
        x: position.x + 400,
        y: currentY,
        size: this.styling.fonts.sizes.small,
        color: this.parseColor(this.styling.colors.text),
      });
    }
  }

  calculateDimensions(data: any): Dimensions {
    return {
      width: 500,
      height: 20,
    };
  }
}

// Export all mappers
export const PDFComponentMappers = {
  TextBlock: TextPDFLayout,
  SignatureBlock: SignaturePDFLayout,
  ImageBlock: ImagePDFLayout,
  TableBlock: TablePDFLayout,
  HeaderBlock: HeaderPDFLayout,
  FooterBlock: FooterPDFLayout,
};

// Register mappers with the global registry
import { ComponentPDFMappers } from "./usePdfTemplateBuilder";

// Register all component mappers
Object.assign(ComponentPDFMappers, PDFComponentMappers);
