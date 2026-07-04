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
        <SummaryBlock />
        {/* need backend code*/}
      </ScrollView>
    </SafeAreaView>
  );
}

const SummaryBlock = () => {
    return (
    <View style={styles.topBlock}>
      <Text style={styles.blockText}>Accounts Summary</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 20,
  },
  topBlock: {
    height: 200,
    backgroundColor: '#6200ee',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  blockText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
  },
});