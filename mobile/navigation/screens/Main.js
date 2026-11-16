// File: Main.js
// This is the part of the app with the bottom tabs, it shows the home, assistant or settings screen above the tab bar

import { useState, useLayoutEffect } from "react";
import { View, StyleSheet } from "react-native";

import Home from "./Home";
import Assistant from "./Assistant";
import Settings from "./Settings";
import TabBar from "../../components/TabBar";
import { useSettings } from "../../context/SettingsContext";

// what the header at the top says for each tab
const TITLES = {
  home: "SPROUT",
  assistant: "Assistant",
  settings: "Settings",
};

export default function Main({ navigation }) {
  const { colors } = useSettings();
  const [tab, setTab] = useState("home"); // which tab is showing: "home", "assistant" or "settings"

  // change the title in the header whenever the tab changes, the home tab gets the green logo color
  useLayoutEffect(() => {
    navigation.setOptions({
      title: TITLES[tab],
      headerTitleStyle: {
        color: tab === "home" ? colors.greenDark : colors.text,
        fontWeight: "700",
      },
    });
  }, [navigation, tab, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* only the screen for the picked tab is shown */}
      <View style={styles.screen}>
        {tab === "home" && <Home navigation={navigation} />}
        {tab === "assistant" && <Assistant />}
        {tab === "settings" && <Settings navigation={navigation} />}
      </View>

      <TabBar active={tab} onChange={setTab} />
    </View>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  screen: { // takes up everything above the tab bar
    flex: 1,
  },
});
