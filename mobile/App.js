// File: App.js
// This is the root of the app, it holds the navigation stack that every screen gets added to

import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { SettingsProvider, useSettings } from "./context/SettingsContext";

import Login from "./navigation/screens/Login";
import Signup from "./navigation/screens/Signup";
import Main from "./navigation/screens/Main";
import Spending from "./navigation/screens/Spending";
import Income from "./navigation/screens/Income";
import Savings from "./navigation/screens/Savings";
import Debt from "./navigation/screens/Debt";
import Bills from "./navigation/screens/Bills";

const Stack = createNativeStackNavigator();

// the settings provider has to be on the outside so the navigation can read dark mode from it
export default function App() {
  return (
    <SettingsProvider>
      <Navigation />
    </SettingsProvider>
  );
}

function Navigation() {
  const { colors, darkMode } = useSettings();

  // start from the built in light or dark theme and put the sprout colors on top
  const baseTheme = darkMode ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.green,
      background: colors.bg,
      card: colors.card,
      text: colors.text,
      border: colors.line,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {/* the clock and battery icons at the top, light icons on the dark theme and dark icons on the light one */}
      <StatusBar style={darkMode ? "light" : "dark"} />

      {/* the app always opens on the login screen, there is no guest option */}
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerTitleAlign: "center",
          headerTintColor: colors.green, // color of the back button
          headerTitleStyle: { color: colors.text },
          headerBackTitle: "Home",
        }}
      >
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />

        {/* Main is the part with the bottom tabs (home, assistant, settings), it sets its own title */}
        <Stack.Screen name="Main" component={Main} />

        {/* the summary screens that open from the cards on the home screen */}
        <Stack.Screen name="Spending" component={Spending} />
        <Stack.Screen name="Income" component={Income} />
        <Stack.Screen name="Savings" component={Savings} />
        <Stack.Screen name="Debt" component={Debt} />
        <Stack.Screen name="Bills" component={Bills} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
