// File: Savings.js
// This is the savings screen, the total of every savings and investment account and then each one broken down

import { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";

import AppText from "../../components/AppText";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Choices from "../../components/Choices";
import Hero from "../../components/Hero";
import Input from "../../components/Input";
import Row from "../../components/Row";
import SectionTitle from "../../components/SectionTitle";
import { useSettings } from "../../context/SettingsContext";
import { money, total, plural } from "../../utils/format";
import { savingsAccounts, investmentAccounts } from "../../data/sampleData";

// the account types on the add form, the last two are the ones that count as investments
const ACCOUNT_TYPES = ["Savings", "High-Yield Savings", "CD", "Money Market", "Investment", "Retirement"];
const TYPE_OPTIONS = ACCOUNT_TYPES.map((name) => ({ label: name, value: name }));

export default function Savings() {
  const { colors } = useSettings();
  const [savings, setSavings] = useState(savingsAccounts);
  const [investments, setInvestments] = useState(investmentAccounts);
  const [openIndex, setOpenIndex] = useState(null); // which investment account is opened up to show its holdings
  const [formOpen, setFormOpen] = useState(false);

  // the boxes on the add account form
  const [name, setName] = useState("");
  const [type, setType] = useState("Savings");
  const [balance, setBalance] = useState("");

  const savingsTotal = total(savings, "balance") + total(investments, "balance");
  const accountCount = savings.length + investments.length;

  // runs when the user taps Save on the add account form
  // nothing is sent to the backend yet, it only gets added to the lists on this screen
  const handleSave = () => {
    const number = Number(balance);
    if (!name || balance === "" || isNaN(number) || number < 0) {
      Alert.alert("Error", "Enter a name and a balance for the account.");
      return;
    }

    // the type is shown as the bold name and the name the user typed goes underneath, same as the linked accounts
    const newAccount = { name: type, detail: name + " · added manually", balance: number };
    if (type === "Investment" || type === "Retirement") {
      setInvestments([...investments, { ...newAccount, holdings: [] }]);
    } else {
      setSavings([...savings, newAccount]);
    }

    // clear the form and close it
    setName("");
    setBalance("");
    setFormOpen(false);
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets={true}>
      <Hero
        label="Total Savings"
        amount={money(savingsTotal)}
        sub={plural(accountCount, "account") + " · checking is not counted"}
      />

      <View style={styles.content}>
        <SectionTitle>Savings accounts</SectionTitle>
        <Card>
          {savings.map((account, index) => (
            <Row
              key={index}
              first={index === 0}
              name={account.name}
              meta={account.detail}
              value={money(account.balance)}
            />
          ))}
        </Card>

        {/* investments open up to show the individual holdings */}
        <SectionTitle>Investments · tap to see holdings</SectionTitle>
        <Card>
          {investments.map((account, index) => {
            const isOpen = openIndex === index;
            return (
              <View key={index}>
                <Row
                  first={index === 0}
                  name={account.name}
                  meta={account.detail}
                  value={money(account.balance) + (isOpen ? "  ▴" : "  ▾")}
                  onPress={() => setOpenIndex(isOpen ? null : index)}
                />

                {isOpen && (
                  <View style={[styles.holdings, { backgroundColor: colors.bg }]}>
                    {account.holdings.length === 0 && (
                      <AppText variant="meta" style={styles.holdingText}>No holdings listed for this account.</AppText>
                    )}
                    {account.holdings.map((holding) => (
                      <View key={holding.symbol} style={styles.holding}>
                        <AppText variant="meta" style={styles.holdingText} color={colors.text}>
                          {holding.symbol} · {plural(holding.shares, "share")} × {money(holding.price)}
                        </AppText>
                        <AppText variant="meta" style={styles.holdingValue} color={colors.text}>
                          {money(holding.shares * holding.price)}
                        </AppText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </Card>

        <Button title="+ Add Account" variant="ghost" onPress={() => setFormOpen(!formOpen)} />
        {formOpen && (
          <Card style={styles.form}>
            <Input placeholder="Account name" value={name} onChangeText={setName} autoCapitalize="words" />
            <Choices options={TYPE_OPTIONS} value={type} onChange={setType} style={styles.choices} />
            <Input placeholder="Balance" value={balance} onChangeText={setBalance} keyboardType="decimal-pad" />
            <Button title="Save" small onPress={handleSave} />
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  content: { // everything under the green header
    padding: 16,
    paddingBottom: 32,
  },

  holdings: { // grey box that drops down under an investment account
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },

  holding: { // one holding, what it is on the left and what it is worth on the right
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },

  holdingText: {
    marginTop: 0,
  },

  holdingValue: {
    marginTop: 0,
    fontWeight: "700",
  },

  form: { // the add form sits right under its button
    marginTop: 12,
  },

  choices: {
    marginBottom: 14,
  },
});
