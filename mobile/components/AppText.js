// File: AppText.js
// This is the text component every screen uses, it picks up the dark mode color and the font size from settings

import { Text, StyleSheet } from "react-native";

import { useSettings } from "../context/SettingsContext";

// the font size for each kind of text, before the font size setting is applied
const SIZES = {
  body: 15,
  name: 15, // the bold line in a row
  meta: 13, // the small grey line under it
  label: 11.5, // small uppercase label
  amount: 24, // the big dollar amounts on cards
  title: 16, // card titles
  heading: 24, // titles on the sign up screen
  tiny: 10.5, // inside the calendar days
};

// variant is one of the names above, color is optional and overrides the default color
export default function AppText({ variant = "body", color, style, children, ...rest }) {
  const { colors, fontScale } = useSettings();

  // meta and label text is grey unless a color is passed in
  const isGrey = variant === "meta" || variant === "label";
  const textColor = color || (isGrey ? colors.muted : colors.text);

  return (
    <Text
      style={[styles[variant], { fontSize: SIZES[variant] * fontScale, color: textColor }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  body: {},
  name: {
    fontWeight: "600",
  },
  meta: {
    marginTop: 2,
  },
  label: { // small uppercase label, like "MONTHLY SPENDING"
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  amount: {
    fontWeight: "700",
    marginTop: 2,
  },
  title: {
    fontWeight: "700",
  },
  heading: {
    fontWeight: "700",
  },
  tiny: {},
});
