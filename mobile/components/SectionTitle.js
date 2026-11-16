// File: SectionTitle.js
// This is the small grey uppercase heading that sits above a card, like "SAVINGS ACCOUNTS"

import { StyleSheet } from "react-native";

import AppText from "./AppText";

export default function SectionTitle({ children }) {
  return (
    <AppText variant="label" style={styles.title}>{children}</AppText>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  title: {
    marginTop: 10,
    marginBottom: 8,
    marginHorizontal: 4,
  },
});
