// File: Signup.js
// This is the create account screen, it goes through three steps: account details, email code, then linking a bank

import { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import AppText from "../../components/AppText";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Row from "../../components/Row";
import { useSettings } from "../../context/SettingsContext";
import { createAccount, linkBankAccount } from "../../api";
import { radius } from "../../theme";

export default function Signup({ navigation }) {
  const { colors } = useSettings();
  const [step, setStep] = useState(1); // 1 = details, 2 = email code, 3 = link bank
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // the password rules, each one knows if the password typed so far passes it
  const rules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "An uppercase and a lowercase letter", ok: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: "A number and a special character", ok: /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) },
  ];

  // step 1, checks the fields and then creates the account
  const handleCreate = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (!rules.every((rule) => rule.ok)) {
      Alert.alert("Error", "Your password does not meet all of the rules yet.");
      return;
    }

    setLoading(true);
    try {
      await createAccount(username, email, password); // in demo mode this always works, see api.js
      setStep(2);
    } catch (error) {
      // the backend sends the reason (username or email already taken), show it to the user
      Alert.alert("Could not create account", error.message);
    }
    setLoading(false);
  };

  // step 2, the backend does not send or check codes yet so any 6 digits are accepted for now
  const handleVerify = () => {
    if (!/^[0-9]{6}$/.test(code)) {
      Alert.alert("Error", "Enter the 6 digit code from your email.");
      return;
    }
    setStep(3);
  };

  // sign up is done, reset so the back button does not come back here or to log in
  const goHome = () => {
    navigation.reset({ index: 0, routes: [{ name: "Main" }] });
  };

  // step 3, links a plaid sandbox account and then moves on to home
  const handleLink = async () => {
    setLoading(true);
    try {
      await linkBankAccount();
      Alert.alert("Linked", "Your bank account is connected.");
      goHome();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.card }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* three little bars that fill in green as the steps get done */}
        <View style={styles.steps}>
          {[1, 2, 3].map((number) => (
            <View
              key={number}
              style={[styles.stepBar, { backgroundColor: step >= number ? colors.green : colors.line }]}
            />
          ))}
        </View>

        {/* step 1, account details */}
        {step === 1 && (
          <View>
            <AppText variant="heading">Create your account</AppText>
            <AppText style={styles.intro} color={colors.muted}>
              Start keeping all of your finances in one place.
            </AppText>

            <Input placeholder="Username" value={username} onChangeText={setUsername} />
            <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={true} />

            {/* each rule turns green with a check once the password passes it */}
            <View style={styles.rules}>
              {rules.map((rule) => (
                <AppText key={rule.label} variant="meta" color={rule.ok ? colors.green : colors.muted}>
                  {rule.ok ? "✓" : "•"} {rule.label}
                </AppText>
              ))}
            </View>

            <Button title="Continue" onPress={handleCreate} loading={loading} />

            <View style={styles.linkRow}>
              <AppText color={colors.muted}>Already have an account? </AppText>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <AppText style={styles.linkText} color={colors.green}>Sign in</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* step 2, email verification code */}
        {step === 2 && (
          <View>
            <AppText variant="heading">Check your email</AppText>
            <AppText style={styles.intro} color={colors.muted}>
              We sent you a 6 digit code. It expires in 10 minutes.
            </AppText>

            <Input
              style={styles.codeInput}
              placeholder="······"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Button title="Verify" onPress={handleVerify} />

            <View style={styles.linkRow}>
              <TouchableOpacity onPress={() => Alert.alert("Code sent", "A new code would be sent here.")}>
                <AppText style={styles.linkText} color={colors.green}>Send a new code</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* step 3, link a bank account or skip */}
        {step === 3 && (
          <View>
            <AppText variant="heading">Link your bank</AppText>
            <AppText style={styles.intro} color={colors.muted}>
              Connect through Plaid and Sprout will fill in your spending, income, savings, debts and bills
              for you. This is optional, you can always enter things yourself.
            </AppText>

            <View style={[styles.note, { backgroundColor: colors.bg }]}>
              <Row
                first
                name="🔒 Sprout never sees your bank password"
                meta="You log in to your bank inside Plaid"
              />
            </View>

            <Button title="Link Bank Account" onPress={handleLink} loading={loading} />
            <Button title="Skip for now" variant="plain" onPress={goHome} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  container: { // centered up and down like the log in screen
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },

  steps: { // the row of progress bars
    flexDirection: "row",
    gap: 6,
    marginBottom: 24,
  },

  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },

  intro: { // grey sentence under each title
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 21,
  },

  rules: { // the password rules list
    marginTop: -2,
    marginBottom: 16,
    marginLeft: 4,
  },

  codeInput: { // big spaced out numbers for the email code
    textAlign: "center",
    fontSize: 22,
    letterSpacing: 10,
  },

  note: { // grey box around the plaid note
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 16,
  },

  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },

  linkText: {
    fontWeight: "600",
  },
});
