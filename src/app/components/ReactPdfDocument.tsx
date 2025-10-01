import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  ReactPdfDocumentProps,
  getThemeStyles,
} from "../Hooks/useReactPdfBuilder";

// Create styles based on theme
const createStyles = (theme: "light" | "dark") => {
  const themeStyles = getThemeStyles(theme);

  return StyleSheet.create({
    page: themeStyles.page,
    header: themeStyles.header,
    title: themeStyles.title,
    subtitle: themeStyles.subtitle,
    date: themeStyles.date,
    text: themeStyles.text,
    paragraph: themeStyles.paragraph,
    signatureBox: themeStyles.signatureBox,
    signatureName: themeStyles.signatureName,
    signatureTitle: themeStyles.signatureTitle,
    table: themeStyles.table,
    tableHeader: themeStyles.tableHeader,
    tableRow: themeStyles.tableRow,
    tableCell: themeStyles.tableCell,
    footer: themeStyles.footer,
    content: {
      marginBottom: 20,
    },
    section: {
      marginBottom: 15,
    },
  });
};

// Text Component
const TextComponent: React.FC<{ data: any; styles: any }> = ({
  data,
  styles,
}) => <Text style={styles.text}>{data.content}</Text>;

// Header Component
const HeaderComponent: React.FC<{ data: any; styles: any }> = ({
  data,
  styles,
}) => (
  <View style={styles.header}>
    <Text style={styles.title}>{data.title}</Text>
    {data.subtitle && <Text style={styles.subtitle}>{data.subtitle}</Text>}
    <Text style={styles.date}>{data.date}</Text>
  </View>
);

// Signature Component
const SignatureComponent: React.FC<{ data: any; styles: any }> = ({
  data,
  styles,
}) => (
  <View style={styles.signatureBox}>
    <Text style={styles.signatureName}>{data.name}</Text>
    {data.title && <Text style={styles.signatureTitle}>{data.title}</Text>}
  </View>
);

// Table Component
const TableComponent: React.FC<{ data: any; styles: any }> = ({
  data,
  styles,
}) => (
  <View style={styles.table}>
    {/* Table Header */}
    <View style={styles.tableHeader}>
      {data.headers.map((header: string, index: number) => (
        <Text key={index} style={styles.tableCell}>
          {header}
        </Text>
      ))}
    </View>

    {/* Table Rows */}
    {data.rows.map((row: string[], rowIndex: number) => (
      <View key={rowIndex} style={styles.tableRow}>
        {row.map((cell: string, cellIndex: number) => (
          <Text key={cellIndex} style={styles.tableCell}>
            {cell}
          </Text>
        ))}
      </View>
    ))}
  </View>
);

// Main Document Component
const ReactPdfDocument: React.FC<ReactPdfDocumentProps> = ({
  documentState,
  theme,
}) => {
  const styles = createStyles(theme);

  // Process document components
  const renderComponents = () => {
    if (!documentState?.body || !Array.isArray(documentState.body)) {
      return (
        <View style={styles.section}>
          <Text style={styles.text}>No content available</Text>
        </View>
      );
    }

    return documentState.body.map((block: any, index: number) => {
      console.log(`Rendering block ${index}:`, block);

      // Map ContentBlock to React PDF component
      const mappedBlock = mapContentBlockToReactPdf(block, theme);

      switch (mappedBlock.type) {
        case "header":
          return (
            <View key={block.id || index} style={styles.section}>
              <HeaderComponent data={mappedBlock.data} styles={styles} />
            </View>
          );

        case "signature":
          return (
            <View key={block.id || index} style={styles.section}>
              <SignatureComponent data={mappedBlock.data} styles={styles} />
            </View>
          );

        case "table":
          return (
            <View key={block.id || index} style={styles.section}>
              <TableComponent data={mappedBlock.data} styles={styles} />
            </View>
          );

        case "text":
        default:
          return (
            <View key={block.id || index} style={styles.section}>
              <TextComponent data={mappedBlock.data} styles={styles} />
            </View>
          );
      }
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Document Header */}
        {documentState?.documentState?.title && (
          <View style={styles.header}>
            <Text style={styles.title}>
              {documentState.documentState.title}
            </Text>
            <Text style={styles.date}>
              Generated on {new Date().toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Document Content */}
        <View style={styles.content}>{renderComponents()}</View>

        {/* Document Footer */}
        <Text style={styles.footer}>
          NCDMB Document Template - Generated on{" "}
          {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

// Helper function to map ContentBlock to React PDF component
const mapContentBlockToReactPdf = (block: any, theme: "light" | "dark") => {
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

export default ReactPdfDocument;
