// File: Card.js
// This is the rounded white box most of the content sits in, it can also be tapped if it is given an onPress

import { View, TouchableOpacity, StyleSheet } from "react-native";

import { useSettings } from "../context/SettingsContext";
import { radius, shadow, spacing } from "../theme";

export default function Card({ children, onPress, style }) {
  const { colors } = useSettings();
  const cardStyle = [styles.card, { backgroundColor: colors.card }, style];

  // with an onPress the whole card works like a button (the cards on the home screen)
  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

// --- STYLING:
const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow,
  },
});
