// File: Icon.js
// This shows one of the app's icons, picked by name. The pictures themselves are in assets/icons
// every icon is a plain black outline on a clear background, so it can be painted any color to match the theme

import { Image } from "react-native";

import { useSettings } from "../context/SettingsContext";

// every icon the app has, a new one needs its png added to assets/icons and a line added here
const ICONS = {
  home: require("../assets/icons/home.png"),
  chat: require("../assets/icons/chat.png"),
  settings: require("../assets/icons/settings.png"),
  savings: require("../assets/icons/savings.png"),
  debt: require("../assets/icons/debt.png"),
  bills: require("../assets/icons/bills.png"),
  lock: require("../assets/icons/lock.png"),
  sparkle: require("../assets/icons/sparkle.png"),
};

// name   - which icon to show, one of the names above
// size   - how wide and tall it is, 22 if nothing is passed
// color  - what color to paint it, the normal text color if nothing is passed
// style  - optional extra styling (margins and things like that)
export default function Icon({ name, size = 22, color, style }) {
  const { colors } = useSettings();

  return (
    <Image
      source={ICONS[name]}
      style={[{ width: size, height: size, tintColor: color || colors.text }, style]}
    />
  );
}
