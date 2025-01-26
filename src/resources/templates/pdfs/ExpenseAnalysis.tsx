import React from "react";
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { ClaimResponseData } from "app/Repositories/Claim/data";
import styles from "./styles";
import logo from "../../assets/images/logo.png";
import claimLogo from "../../assets/images/modules/claim.png";
import bg from "../../assets/images/logo_bg.png";
import {
  covertToWords,
  formatAmountNoCurrency,
  formatDateToPeriodString,
} from "app/Support/Helpers";
import { SignatureProp } from "resources/views/crud/tabs/ClaimAppendSignature";

const ExpenseAnalysis = ({
  state,
  signatures,
}: {
  state: ClaimResponseData;
  signatures?: SignatureProp[];
}) => {
  return (
    <Document>
      <Page size="A4" wrap>
        {/* Page Container */}
        <View style={styles.container}>
          {/* Header Container */}
          <View
            style={[
              styles.box,
              { justifyContent: "space-between", marginBottom: 10 },
            ]}
          >
            {/* Logo Area */}
            <View style={[styles.box, { width: "65%" }]}>
              <Image src={logo} style={styles.logo} />
              <View style={styles.vertical}>
                <Text style={styles.jumboText}>
                  Nigerian Content Development
                </Text>
                <Text style={[styles.jumboText, { marginBottom: 3 }]}>
                  &amp; Monitoring Board
                </Text>
                <Text style={[styles.subtext, { lineHeight: 1 }]}>
                  Finance &amp; Account Directorate
                </Text>
                <Text style={styles.subtext}>Analysis of Expenditure</Text>
              </View>
            </View>
            {/* End Logo Area */}
            {/* Claim Logo Area */}
            <View
              style={[
                styles.vertical,
                {
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  width: "35%",
                },
              ]}
            >
              <Image
                src={claimLogo}
                style={{
                  width: "25%",
                  marginBottom: 4,
                }}
              />
              <Text style={styles.span}>{state.code}</Text>
            </View>
            {/* End Claim Logo Area */}
          </View>
          {/* End Header Container */}
          {/* Body Container */}
          <View style={styles.vertical}>
            {/* Title */}
            <View style={[styles.vertical, { marginBottom: 25 }]}>
              <Text style={[styles.subtext, { lineHeight: 1 }]}>
                Purpose of Claim:
              </Text>
              <Text style={styles.title}>{state.title}</Text>
            </View>
            {/* End Title */}
            {/* Expenses Area */}
            <View style={styles.vertical}>
              {state.expenses.map((expense, idx) => (
                <View key={idx} style={[styles.box, styles.expenseContainer]}>
                  {/* Trackline */}
                  <View style={styles.trackline} />
                  {/* Description and Date */}
                  <View style={[styles.vertical, { lineHeight: 1 }]}>
                    <Text style={styles.expenseDescription}>
                      {expense.description}
                    </Text>
                    <Text style={[styles.subtext, { fontSize: 7 }]}>
                      {formatDateToPeriodString(
                        expense.start_date,
                        expense.end_date
                      )}
                    </Text>
                  </View>
                  {/* Expense Amount */}
                  <Text style={styles.amount}>
                    {formatAmountNoCurrency(expense.total_amount_spent)}
                  </Text>
                </View>
              ))}
            </View>
            {/* End Expenses Area */}
            {/* Total Analysis Section */}
            <View
              style={[styles.vertical, { marginBottom: 15, marginTop: 10 }]}
            >
              <Text
                style={[styles.subtext, { lineHeight: 1, color: "#137547" }]}
              >
                Total Amount Spent:
              </Text>
              <Text style={[styles.title, { marginBottom: 25 }]}>
                {formatAmountNoCurrency(state.total_amount_spent)}
              </Text>
              <Text
                style={[styles.subtext, { lineHeight: 1, color: "#137547" }]}
              >
                Amount in Words:
              </Text>
              <Text
                style={[
                  styles.title,
                  { lineHeight: 1.2, fontSize: 16, marginBottom: 15 },
                ]}
              >
                {covertToWords(state.total_amount_spent)}
              </Text>
            </View>
            {/* End Total Analysis Section */}

            <View style={[styles.box, { justifyContent: "space-between" }]}>
              <View style={[styles.vertical, { width: "50%" }]}>
                <Text
                  style={[styles.subtext, { lineHeight: 1, color: "#137547" }]}
                >
                  Staff ID:
                </Text>
                <Text
                  style={[
                    styles.title,
                    { lineHeight: 1.2, fontSize: 16, marginBottom: 5 },
                  ]}
                >
                  {state.owner?.staff_no}
                </Text>
                <Text
                  style={[styles.subtext, { lineHeight: 1, color: "#137547" }]}
                >
                  Grade Level:
                </Text>
                <Text
                  style={[
                    styles.title,
                    { lineHeight: 1.2, fontSize: 16, marginBottom: 5 },
                  ]}
                >
                  {state.owner?.grade_level}
                </Text>
                <Text
                  style={[styles.subtext, { lineHeight: 1, color: "#137547" }]}
                >
                  Staff Name:
                </Text>
                <Text
                  style={[
                    styles.title,
                    { lineHeight: 1.2, fontSize: 16, marginBottom: 25 },
                  ]}
                >
                  {state.owner?.name}
                </Text>
                {/* Owner Signature */}
                {signatures &&
                  signatures.map((sig, idx) => (
                    <Image
                      key={idx}
                      src={sig.src}
                      style={{
                        width: 150,
                        height: 50,
                        position: "absolute",
                        left: sig.x,
                        top: sig.y,
                      }}
                    />
                  ))}
                <View style={styles.line} />
                <Text
                  style={[styles.subtext, { lineHeight: 1, color: "#137547" }]}
                >
                  Signature of Claimant
                </Text>
              </View>
              <View
                style={[
                  styles.vertical,
                  {
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "flex-end",
                    width: "50%",
                  },
                ]}
              >
                <View style={styles.line} />
                <Text
                  style={[
                    styles.title,
                    { lineHeight: 1.2, fontSize: 12, marginBottom: 25 },
                  ]}
                >
                  Approved
                </Text>

                <View style={styles.line} />
                <Text
                  style={[
                    styles.title,
                    { lineHeight: 1.2, fontSize: 12, marginBottom: 25 },
                  ]}
                >
                  Name in Blocks
                </Text>
              </View>
            </View>
          </View>
          {/* End Body Container */}
          <Image src={bg} style={styles.bg} />
        </View>
        {/* End Page Container */}
      </Page>
    </Document>
  );
};

export default ExpenseAnalysis;
