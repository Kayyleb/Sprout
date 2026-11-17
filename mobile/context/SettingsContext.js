// File: SettingsContext.js
// This keeps the display settings (dark mode, font size, hide values, date order) in one place so every screen can read them
// they are saved on the phone, so they are still the same the next time the app is opened

import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { lightColors, darkColors, fontScales } from "../theme";

const SettingsContext = createContext(null);

// the name the settings are saved under on the phone
export const SETTINGS_KEY = "sprout-display-settings";

// what a new install starts with
const DEFAULTS = {
  darkMode: false,
  fontSize: "medium", // "small", "medium" or "large"
  hideValues: false, // masks the amounts on the home screen
  dateOrder: "MDY", // "MDY", "DMY" or "YMD"
};

// wraps the whole app in App.js
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  // read the saved settings once when the app opens
  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((saved) => {
        if (saved) setSettings(cleanSaved(JSON.parse(saved)));
      })
      .catch(() => {}) // could not read them, just use the defaults
      .finally(() => setLoaded(true));
  }, []);

  // save every time a setting changes, but not before the saved ones are read or the defaults would write over them
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, loaded]);

  // makes a setter for one setting, so the screens can still call setDarkMode(true) like before
  function setter(name) {
    return (newValue) => setSettings((current) => ({ ...current, [name]: newValue }));
  }

  // nothing is drawn until the saved settings are read (it takes a split second)
  // otherwise someone with dark mode on would see the light screens flash first
  if (!loaded) return null;

  const value = {
    ...settings,
    setDarkMode: setter("darkMode"),
    setFontSize: setter("fontSize"),
    setHideValues: setter("hideValues"),
    setDateOrder: setter("dateOrder"),
    // these two are worked out from the settings above so the screens do not have to
    colors: settings.darkMode ? darkColors : lightColors,
    fontScale: fontScales[settings.fontSize],
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

// what the screens call, example: const { colors, dateOrder } = useSettings();
export function useSettings() {
  return useContext(SettingsContext);
}

// only keeps saved values that still make sense, so an old or broken save can not break the app
// anything that does not fit goes back to its default
function cleanSaved(saved) {
  const clean = { ...DEFAULTS };
  if (!saved || typeof saved !== "object") return clean;
  if (typeof saved.darkMode === "boolean") clean.darkMode = saved.darkMode;
  if (typeof saved.hideValues === "boolean") clean.hideValues = saved.hideValues;
  if (fontScales[saved.fontSize]) clean.fontSize = saved.fontSize;
  if (["MDY", "DMY", "YMD"].includes(saved.dateOrder)) clean.dateOrder = saved.dateOrder;
  return clean;
}
