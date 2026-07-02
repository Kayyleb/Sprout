import { useState } from "react";
import {
  View, Text, Button, ScrollView, StyleSheet, Alert, SafeAreaView,
} from "react-native";

const API = "http://localhost:8000";

export default function Home({ navigation }) {
  const [accessToken, setAccessToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Finance App</Text>
        {/* ...paste the rest of your existing JSX here... */}
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