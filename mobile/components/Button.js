// File: Button.js
// This is the button used all over the app, it comes in a few looks picked with the variant prop

import { TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";

import AppText from "./AppText";
import { useSettings } from "../context/SettingsContext";
import { radius } from "../theme";

// variant: "primary" - solid green (default)
//          "ghost"   - green outline, used for the "+ Add" buttons
//          "plain"   - just grey text, used for "Skip for now"
//          "danger"  - red outline, used for Log Out
// small makes it a little shorter, loading swaps the text for a spinner
export default function Button({ title, onPress, variant = "primary", small, loading, style }) {
  const { colors } = useSettings();

  // work out the colors for the look that was asked for
  let backgroundColor = colors.green;
  let borderColor = colors.green;
  let textColor = "#fff";
  if (variant === "ghost") {
    backgroundColor = "transparent";
    textColor = colors.green;
  } else if (variant === "plain") {
    backgroundColor = "transparent";
    borderColor = "transparent";
    textColor = colors.muted;
  } else if (variant === "danger") {
    backgroundColor = "transparent";
    borderColor = colors.red;
    textColor = colors.red;
  }

  return (
    <TouchableOpacity
      style={[styles.button, small && styles.small, { backgroundColor, borderColor }, style]}
      onPress={onPress}
      disabled={loading} // stops a second tap while it is working
      activeOpacity={0.7}
      accessibilityRole="button" // so a screen reader says "button" after the title
      accessibilityState={{ disabled: !!loading, busy: !!loading }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText style={styles.text} color={textColor}>{title}</AppText>
      )}
    </TouchableOpacity>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },

  small: {
    height: 42,
  },

  text: {
    fontWeight: "600",
  },
});
