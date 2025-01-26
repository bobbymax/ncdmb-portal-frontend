import { PDFViewer, StyleSheet } from "@react-pdf/renderer";
import ClaimRepository from "app/Repositories/Claim/ClaimRepository";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import React from "react";
import ExpenseAnalysis from "resources/templates/pdfs/ExpenseAnalysis";
import { DocumentControlStateProps } from "resources/views/pages/ViewResourcePage";

const styles = StyleSheet.create({
  viewer: {
    width: "100%", //the pdf viewer will take up all of the width and height
    height: 620,
  },
});

const PrintDocument: React.FC<
  DocumentControlStateProps<ClaimResponseData, ClaimRepository>
> = ({ data, tab, Repo, loading, view }) => {
  return (
    <PDFViewer style={styles.viewer}>
      <ExpenseAnalysis state={data} />
    </PDFViewer>
  );
};

export default PrintDocument;
