// File: App.js
// This is the root of the mobile app, it sets up the navigation and lists every screen the app can move between

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./navigation/screens/Login";
import Home from "./navigation/screens/Home";

const Stack = createNativeStackNavigator();

// root of the app, holds the navigation stack that every screen gets added to
export default function App() {
  return (
    <NavigationContainer>
      {/* the app always opens on the login screen, there is no guest option */}
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: "SPROUT" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
