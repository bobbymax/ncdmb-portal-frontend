import { StyleSheet, Font } from "@react-pdf/renderer";

import PoppinsRegular from "../../assets/fonts/poppins/Poppins-Regular.ttf";
import PoppinsBold from "../../assets/fonts/poppins/Poppins-Bold.ttf";
import PoppinsLight from "../../assets/fonts/poppins/Poppins-Light.ttf";
import PoppinsMedium from "../../assets/fonts/poppins/Poppins-Medium.ttf";
import PoppinsBoldItalic from "../../assets/fonts/poppins/Poppins-BoldItalic.ttf";

Font.register({
  family: "Poppins",
  fonts: [
    { src: PoppinsRegular },
    { src: PoppinsBold, fontWeight: 700 },
    { src: PoppinsLight },
    { src: PoppinsMedium, fontWeight: 500 },
    { src: PoppinsBoldItalic, fontWeight: 700, fontStyle: "italic" },
  ],
});

const pallete = {
  primary: "#137547",
  secondary: "#364533",
  highlight: "#596869",
  danger: "#d63031",
  dark: "#2d3436",
  background: "#e2e2e2",
  info: "#0984e3",
  lighter: "#f8f8f8",
  warning: "#fdcb6e",
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    fontSize: 11,
    lineHeight: 1.5,
    fontFamily: "Poppins",
    position: "relative",
    padding: 16,
  },
  bg: {
    position: "absolute",
    width: "100%",
    zIndex: -1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.4,
  },
  box: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 3,
  },
  inner: {
    width: "50%",
  },
  vertical: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    lineHeight: 1,
  },
  logo: {
    width: "16%",
  },
  span: {
    fontSize: 10,
    letterSpacing: 0.6,
    fontWeight: 600,
    color: pallete.highlight,
  },
  jumboText: {
    fontSize: 16,
    textTransform: "uppercase",
    fontWeight: 600,
    color: pallete.primary,
  },
  subtext: {
    fontSize: 9,
    color: pallete.dark,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    margin: 0,
    color: pallete.highlight,
  },
  trackline: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "transparent",
    border: `2px solid ${pallete.info}`,
  },
  expenseContainer: {
    gap: 15,
    padding: "4px 16px",
    backgroundColor: pallete.lighter,
    borderRadius: 4,
    marginBottom: 5,
  },
  expenseDescription: {
    fontSize: 10,
    color: pallete.info,
    lineHeight: 1.2,
    fontWeight: 500,
  },
  amount: {
    fontSize: 13,
    fontWeight: 600,
    color: pallete.primary,
    letterSpacing: 1,
    marginBottom: 5,
  },
  line: {
    width: 168,
    height: 32,
    borderBottom: `1px dashed ${pallete.highlight}`,
  },
});

export default styles;
