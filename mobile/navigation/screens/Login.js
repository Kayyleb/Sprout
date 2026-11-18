// File: Login.js
// This is the log in screen, the first thing the user sees when opening the app

import { useState } from "react";
import {
  StyleSheet,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import LoginImage from "../../assets/Sprout.png";
import AppText from "../../components/AppText";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useSettings } from "../../context/SettingsContext";
import { login } from "../../api";

export default function Login({ navigation }) {
  const { colors } = useSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // true while the sign in is working, swaps the button text for a spinner

  // runs when the user taps Sign In
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password); // in demo mode this always works, see api.js
      navigation.replace("Main"); // replace so the back button does not go back to login
    } catch (error) {
      // the backend sends the reason (wrong email or password), show it to the user
      Alert.alert("Could not sign in", error.message);
    }
    setLoading(false);
  };

  // no reset flow yet, this is where the reset code email will get sent from
  const handleForgot = () => {
    Alert.alert("Forgot password", "A reset code would be emailed here.");
  };

  return (
    // moves everything up when the keyboard opens so the inputs are not covered
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.card }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image source={LoginImage} style={styles.logoImage} />
          <AppText style={styles.logoText} color={colors.greenDark}>SPROUT</AppText>
        </View>

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
        />

        <Button title="Sign In" onPress={handleLogin} loading={loading} />

        <TouchableOpacity style={styles.link} onPress={handleForgot}>
          <AppText style={styles.linkText} color={colors.green}>Forgot password?</AppText>
        </TouchableOpacity>

        <View style={[styles.link, styles.linkRow]}>
          <AppText color={colors.muted}>New to Sprout? </AppText>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <AppText style={styles.linkText} color={colors.green}>Create an account</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  container: { // styling for the page, making sure everything is centered
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  logoContainer: { // make sure the logo is centered
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  logoImage: { // the sprout logo
    height: 210,
    width: 210,
    resizeMode: "contain",
  },

  logoText: { // app name, pulled up so it sits on the bottom of the logo
    marginTop: -18,
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 2,
  },

  link: { // the two lines of links under the button
    marginTop: 16,
  },

  linkRow: {
    flexDirection: "row",
  },

  linkText: {
    fontWeight: "600",
  },
});
