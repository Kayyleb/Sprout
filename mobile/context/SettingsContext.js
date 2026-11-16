// File: SettingsContext.js
// This keeps the display settings (dark mode, font size, hide values, date order) in one place so every screen can read them

import { createContext, useContext, useState } from "react";

import { lightColors, darkColors, fontScales } from "../theme";

const SettingsContext = createContext(null);

// wraps the whole app in App.js
// the settings only live in memory for now, so they go back to the defaults when the app is closed
export function SettingsProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("medium"); // "small", "medium" or "large"
  const [hideValues, setHideValues] = useState(false); // masks the amounts on the home screen
  const [dateOrder, setDateOrder] = useState("MDY"); // "MDY", "DMY" or "YMD"

  const value = {
    darkMode,
    setDarkMode,
    fontSize,
    setFontSize,
    hideValues,
    setHideValues,
    dateOrder,
    setDateOrder,
    // these two are worked out from the settings above so the screens do not have to
    colors: darkMode ? darkColors : lightColors,
    fontScale: fontScales[fontSize],
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

// what the screens call, example: const { colors, dateOrder } = useSettings();
export function useSettings() {
  return useContext(SettingsContext);
}
