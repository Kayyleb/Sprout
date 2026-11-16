// File: Choices.js
// This is a row of little pill buttons where one is picked at a time, used instead of a dropdown

import { View, TouchableOpacity, StyleSheet } from "react-native";

import AppText from "./AppText";
import { useSettings } from "../context/SettingsContext";

// options is a list like [{ label: "Small", value: "small" }, ...]
// value is the one that is picked right now, onChange gets called with the new value
export default function Choices({ options, value, onChange, style }) {
  const { colors } = useSettings();

  return (
    <View style={[styles.wrap, style]}>
      {options.map((option) => {
        const picked = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.pill,
              { borderColor: picked ? colors.green : colors.line },
              picked && { backgroundColor: colors.green },
            ]}
            onPress={() => onChange(option.value)}
          >
            <AppText variant="meta" style={styles.pillText} color={picked ? "#fff" : colors.text}>
              {option.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  wrap: { // the pills wrap onto a second line if they do not fit
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  pill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },

  pillText: {
    marginTop: 0,
    fontWeight: "500",
  },
});
