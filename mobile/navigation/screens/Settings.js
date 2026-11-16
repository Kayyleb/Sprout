// File: Settings.js
// This is the settings screen, account info, connected banks, and how the app looks

import { useState } from "react";
import { View, ScrollView, Switch, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";

import AppText from "../../components/AppText";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Choices from "../../components/Choices";
import Row from "../../components/Row";
import SectionTitle from "../../components/SectionTitle";
import { useSettings } from "../../context/SettingsContext";
import { formatDate, todayIso, plural } from "../../utils/format";
import { linkBankAccount, getBalances } from "../../api";
import { user, linkedBanks } from "../../data/sampleData";

const FONT_OPTIONS = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

const DATE_OPTIONS = [
  { label: "MM/DD/YYYY", value: "MDY" },
  { label: "DD/MM/YYYY", value: "DMY" },
  { label: "YYYY/MM/DD", value: "YMD" },
];

export default function Settings({ navigation }) {
  const settings = useSettings();
  const { colors, dateOrder } = settings;
  const [banks, setBanks] = useState(linkedBanks); // starts as the sample banks
  const [connecting, setConnecting] = useState(false); // true while a new bank is being linked

  // changing these is not built yet, this is where the current password check will go
  const handleChange = (what) => {
    Alert.alert("Change " + what, "You would enter your current password here, then your new " + what + ".");
  };

  // asks first, then takes the bank off the list
  const handleDisconnect = (bank) => {
    Alert.alert("Disconnect " + bank.name + "?", "Sprout will stop pulling new data from this bank.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Disconnect",
        style: "destructive",
        // "current" is the list as it is when the button is tapped, not as it was when the alert opened
        onPress: () => setBanks((current) => current.filter((item) => item !== bank)),
      },
    ]);
  };

  // handler to link a plaid sandbox account, then reads its balances to count the accounts
  const handleConnect = async () => {
    setConnecting(true);
    try {
      const accessToken = await linkBankAccount();
      const accounts = await getBalances(accessToken);

      setBanks((current) => [
        ...current,
        { name: "Plaid Sandbox Bank", accounts: accounts.length, linkedDate: todayIso() },
      ]);
      Alert.alert("Linked", "Sandbox account connected.");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
    setConnecting(false);
  };

  // reset so the back button can not get back into the app after logging out
  const handleLogOut = () => {
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  // the green "Change" link on the right of the account rows
  const changeLink = (what) => (
    <TouchableOpacity onPress={() => handleChange(what)}>
      <AppText variant="meta" style={styles.link} color={colors.green}>Change</AppText>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle>Account</SectionTitle>
      <Card>
        <Row first name="Username" meta={user.username} right={changeLink("username")} />
        <Row name="Email" meta={user.email} right={changeLink("email")} />
        <Row name="Password" meta="••••••••••" right={changeLink("password")} />
      </Card>

      <SectionTitle>Bank accounts</SectionTitle>
      <Card>
        {banks.map((bank, index) => (
          <Row
            key={index}
            first={index === 0}
            name={bank.name}
            meta={plural(bank.accounts, "account") + " · linked " + formatDate(bank.linkedDate, dateOrder)}
            right={
              <TouchableOpacity onPress={() => handleDisconnect(bank)}>
                <AppText variant="meta" style={styles.link} color={colors.red}>Disconnect</AppText>
              </TouchableOpacity>
            }
          />
        ))}

        <TouchableOpacity
          style={[styles.connect, { borderTopColor: colors.line }, banks.length === 0 && styles.connectOnly]}
          onPress={handleConnect}
          disabled={connecting}
        >
          {connecting ? (
            <ActivityIndicator color={colors.green} />
          ) : (
            <AppText variant="name" color={colors.green}>+ Connect a new account</AppText>
          )}
        </TouchableOpacity>
      </Card>

      {/* these all change the app right away, they are kept in SettingsContext */}
      <SectionTitle>Display</SectionTitle>
      <Card>
        <View style={styles.block}>
          <AppText variant="name">Font size</AppText>
          <Choices options={FONT_OPTIONS} value={settings.fontSize} onChange={settings.setFontSize} style={styles.choices} />
        </View>

        <Row
          name="Dark mode"
          right={
            <Switch
              value={settings.darkMode}
              onValueChange={settings.setDarkMode}
              trackColor={{ true: colors.green, false: colors.line }}
            />
          }
        />

        <Row
          name="Hide account values"
          meta="Masks the amounts on the homepage"
          right={
            <Switch
              value={settings.hideValues}
              onValueChange={settings.setHideValues}
              trackColor={{ true: colors.green, false: colors.line }}
            />
          }
        />

        <View style={[styles.block, styles.lastBlock, { borderTopColor: colors.line }]}>
          <AppText variant="name">Date order</AppText>
          <Choices options={DATE_OPTIONS} value={dateOrder} onChange={settings.setDateOrder} style={styles.choices} />
        </View>
      </Card>

      <Button title="Log Out" variant="danger" onPress={handleLogOut} style={styles.logOut} />
    </ScrollView>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  content: { // the scrolling area
    padding: 16,
    paddingBottom: 32,
  },

  link: { // the "Change" and "Disconnect" links
    marginTop: 0,
    fontWeight: "600",
  },

  connect: { // the last line of the bank card
    borderTopWidth: 1,
    paddingTop: 12,
    minHeight: 32,
    alignItems: "flex-start",
  },

  connectOnly: { // when every bank has been disconnected there is no row above it to draw a line under
    borderTopWidth: 0,
    paddingTop: 0,
  },

  block: { // a setting with its choices underneath instead of on the right
    paddingBottom: 12,
  },

  lastBlock: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 0,
  },

  choices: {
    marginTop: 8,
  },

  logOut: {
    marginTop: 8,
  },
});
