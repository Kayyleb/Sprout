import { useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";

// ⚠️  IMPORTANT — the API URL depends on where you're running the app:
//   iOS simulator:      http://localhost:8000
//   Android emulator:   http://10.0.2.2:8000
//   Physical device:    http://YOUR_COMPUTER_LAN_IP:8000  (e.g. 192.168.1.42)
// "localhost" on a phone means the phone itself, not your computer.
const API = "http://localhost:8000";

export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Step 1 + 2: create a sandbox public token, then exchange it for an access token
  async function linkAccount() {
    try {
      const linkRes = await fetch(`${API}/create-link-token`, { method: "POST" });
      const linkData = await linkRes.json();

      const exchangeRes = await fetch(`${API}/exchange-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token: linkData.public_token }),
      });
      const exchangeData = await exchangeRes.json();

      setAccessToken(exchangeData.access_token);
      Alert.alert("Linked!", "Sandbox account connected.");
    } catch (err) {
      Alert.alert("Error", String(err));
    }
  }

  // Step 3: balances
  async function fetchBalances() {
    const res = await fetch(`${API}/balances?access_token=${accessToken}`);
    const data = await res.json();
    setAccounts(data.accounts);
  }

  // Step 4: transactions
  async function fetchTransactions() {
    const res = await fetch(`${API}/transactions?access_token=${accessToken}`);
    const data = await res.json();
    setTransactions(data.transactions);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Finance App</Text>

        <Button title="Link Sandbox Account" onPress={linkAccount} />

        {accessToken && (
          <>
            <View style={styles.spacer} />
            <Button title="Get Balances" onPress={fetchBalances} />
            <View style={styles.spacer} />
            <Button title="Get Transactions" onPress={fetchTransactions} />
          </>
        )}

        {accounts.length > 0 && <Text style={styles.section}>Accounts</Text>}
        {accounts.map((a, i) => (
          <Text key={i} style={styles.item}>
            <Text style={styles.bold}>{a.name}</Text> — Available: ${a.available} / Current: ${a.current}
          </Text>
        ))}

        {transactions.length > 0 && <Text style={styles.section}>Transactions</Text>}
        {transactions.map((t, i) => (
          <Text key={i} style={styles.item}>
            {t.date} — {t.name} — ${t.amount}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, gap: 8 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  section: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  spacer: { height: 8 },
  item: { fontSize: 14, marginVertical: 4 },
  bold: { fontWeight: "bold" },
});