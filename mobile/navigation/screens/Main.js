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
  const [opened, setOpened] = useState(["home"]); // every tab that has been opened at least once

  // shows a tab, and remembers that it has been opened
  const openTab = (id) => {
    setTab(id);
    setOpened((current) => (current.includes(id) ? current : [...current, id]));
  };

  // a tab is only built the first time it is opened, after that it stays alive and is just hidden when another tab is showing
  // so the assistant chat and the settings screen are still the same when the user comes back to them
  const tabView = (id, content) =>
    opened.includes(id) ? (
      <View key={id} style={[styles.screen, tab !== id && styles.hidden]}>{content}</View>
    ) : null;

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
      {tabView("home", <Home navigation={navigation} />)}
      {tabView("assistant", <Assistant />)}
      {tabView("settings", <Settings navigation={navigation} />)}

      <TabBar active={tab} onChange={openTab} />
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

  hidden: { // a tab that is not showing right now, it stays alive but takes up no room
    display: "none",
  },
});
