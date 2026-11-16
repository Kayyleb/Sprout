// File: Hero.js
// This is the green block at the top of each summary screen with the big total in it

import { View, Text, StyleSheet } from "react-native";

import { useSettings } from "../context/SettingsContext";
import { radius } from "../theme";

// label is the small text on top, amount is the big number, sub is the line under it
// color is optional, the debt screen passes in a dark red
export default function Hero({ label, amount, sub, color }) {
  const { colors, fontScale } = useSettings();

  return (
    <View style={[styles.hero, { backgroundColor: color || colors.green }]}>
      <Text style={[styles.label, { fontSize: 13 * fontScale }]}>{label}</Text>
      <Text style={[styles.amount, { fontSize: 36 * fontScale }]}>{amount}</Text>
      {sub ? <Text style={[styles.sub, { fontSize: 13.5 * fontScale }]}>{sub}</Text> : null}
    </View>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  hero: { // only the bottom corners are rounded, the top sits right under the header
    paddingTop: 26,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },

  label: {
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  amount: {
    color: "#fff",
    fontWeight: "700",
    marginTop: 4,
  },

  sub: {
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginTop: 4,
  },
});
