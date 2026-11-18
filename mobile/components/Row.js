// File: Row.js
// This is one line inside a card, a name (and a small grey line under it) on the left and a value on the right

import { View, TouchableOpacity, StyleSheet } from "react-native";

import AppText from "./AppText";
import Icon from "./Icon";
import { useSettings } from "../context/SettingsContext";
import { spacing } from "../theme";

// name       - the bold text on the left
// meta       - optional small grey text under the name
// value      - optional text on the right, valueColor changes its color
// dot        - optional color for a little dot in front of the name (bills use this)
// icon       - optional name of an icon to show in front of the name
// right      - optional, anything to show on the right instead of value (a switch, a "Change" link...)
// first      - true for the first row in a card so it does not draw the line above it
// onPress    - optional, makes the whole row tappable
export default function Row({ name, meta, value, valueColor, dot, icon, right, first, onPress }) {
  const { colors } = useSettings();

  // a row is only a button when it has something to do
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.row, { borderTopColor: colors.line }, first && styles.first]}
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
    >
      <View style={styles.left}>
        <View style={styles.nameLine}>
          {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
          {icon ? <Icon name={icon} size={16} style={styles.icon} /> : null}
          <AppText variant="name">{name}</AppText>
        </View>
        {meta ? <AppText variant="meta">{meta}</AppText> : null}
      </View>

      {right ? right : null}
      {!right && value ? (
        <AppText variant="name" color={valueColor}>{value}</AppText>
      ) : null}
    </Wrapper>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: 11,
    borderTopWidth: 1,
  },

  first: { // no line above the first row
    borderTopWidth: 0,
    paddingTop: 0,
  },

  left: { // takes up the space the value does not need, so long names wrap instead of pushing the value off
    flex: 1,
  },

  nameLine: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  icon: {
    marginRight: 6,
  },
});
