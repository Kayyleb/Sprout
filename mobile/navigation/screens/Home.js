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
        <Text style={styles.title}>Sprout</Text>
        {/* need backend code*/}
      </ScrollView>
    </SafeAreaView>
  );
}

const SummaryBlock = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topBlock} >
                <Text style={styles.blockText}>Header</Text>
            </View>
            <View style={styles.content}>
                
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBlock: {
    height: 200, // Adjust this value to make the block larger or smaller
    backgroundColor: '#6200ee',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20, // Optional: smooth styling
    borderBottomRightRadius: 20,
    elevation: 5, // Optional: adds a shadow on Android
    shadowColor: '#000', // Optional: adds shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  blockText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
}); { fontWeight: "bold" }