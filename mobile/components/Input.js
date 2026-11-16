// File: Input.js
// This is the text box used on the log in screen and on every form, same look as the original log in inputs

import { TextInput, StyleSheet } from "react-native";

import { useSettings } from "../context/SettingsContext";
import { radius } from "../theme";

// takes the same props as a normal TextInput (placeholder, value, onChangeText, keyboardType...)
export default function Input({ style, ...rest }) {
  const { colors, fontScale } = useSettings();

  return (
    <TextInput
      style={[
        styles.input,
        { backgroundColor: colors.input, color: colors.text, fontSize: 16 * fontScale },
        style,
      ]}
      placeholderTextColor={colors.muted}
      autoCapitalize="none"
      {...rest}
    />
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 50,
    borderRadius: radius.md,
    paddingHorizontal: 15,
    marginBottom: 12,
  },
});
