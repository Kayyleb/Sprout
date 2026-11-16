// File: TabBar.js
// This is the bar at the bottom of the app with the Home, Assistant and Settings tabs

import { View, TouchableOpacity, Platform, StyleSheet } from "react-native";

import AppText from "./AppText";
import Icon from "./Icon";
import { useSettings } from "../context/SettingsContext";

const TABS = [
  { id: "home", icon: "home", label: "Home" },
  { id: "assistant", icon: "chat", label: "Assistant" },
  { id: "settings", icon: "settings", label: "Settings" },
];

// extra room under the tabs so they do not sit on top of the home bar at the bottom of the phone
// this is a guess that looks right on most phones, it is not measured from the real device
const BOTTOM_SPACE = Platform.OS === "ios" ? 24 : 12;

// the assistant screen needs to know how tall this bar is when the keyboard opens
export const TAB_BAR_HEIGHT = 56 + BOTTOM_SPACE;

// active is the id of the tab that is showing, onChange gets called with the id of the tab that was tapped
export default function TabBar({ active, onChange }) {
  const { colors } = useSettings();

  return (
    <View style={[styles.bar, { backgroundColor: colors.card, borderTopColor: colors.line }]}>
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
    height: TAB_BAR_HEIGHT,
    paddingBottom: BOTTOM_SPACE,
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
