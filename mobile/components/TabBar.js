// File: TabBar.js
// This is the bar at the bottom of the app with the Home, Assistant and Settings tabs

import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "./AppText";
import Icon from "./Icon";
import { useSettings } from "../context/SettingsContext";

const TABS = [
  { id: "home", icon: "home", label: "Home" },
  { id: "assistant", icon: "chat", label: "Assistant" },
  { id: "settings", icon: "settings", label: "Settings" },
];

// how tall the row of tabs is, not counting the extra room under it
const TABS_HEIGHT = 56;

// the full height of the bar on this phone, the tabs plus the room the phone needs at the bottom (the home bar on an iphone)
// the assistant screen also uses this to know how far to move up when the keyboard opens
export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  return TABS_HEIGHT + insets.bottom;
}

// active is the id of the tab that is showing, onChange gets called with the id of the tab that was tapped
export default function TabBar({ active, onChange }) {
  const { colors } = useSettings();
  const insets = useSafeAreaInsets();
  const height = useTabBarHeight();

  return (
    <View
      style={[
        styles.bar,
        { height: height, paddingBottom: insets.bottom, backgroundColor: colors.card, borderTopColor: colors.line },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onChange(tab.id)}
            activeOpacity={0.7}
          >
            {/* the tab that is picked is green, the other two are grey */}
            <Icon name={tab.icon} size={24} color={isActive ? colors.green : colors.muted} />
            <AppText
              variant="label"
              style={styles.label}
              color={isActive ? colors.green : colors.muted}
            >
              {tab.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
  },

  tab: { // each tab takes a third of the bar
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  label: { // the label style is uppercase by default, the tabs look better without it
    textTransform: "none",
    letterSpacing: 0,
    marginTop: 2,
  },
});
