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

const API = "http://localhost:8000";

// main home screen of the app, after login
export default function Home({ navigation }) {
  const [accessToken, setAccessToken] = useState(null); // accessToken is the plaid token recieved after linking account (sandbox for now)
  const [accounts, setAccounts] = useState([]); // accounts is the list of bank accounts and balances taken in from plaid. 
  const [transactions, setTransactions] = useState([]); // transactions, reserved for when we i transaction fetching

  // handler to link plaid sandbox account
  //  create link token -> gets a public token
  //  exchange token -> swaps that for a real access token we can use
  async function linkAccount() {
    try {
      // create a public token
      const linkResponse = await fetch(API + "/create-link-token", {
        method: "POST",
      });
      const linkData = await linkResponse.json();
      const publicToken = linkData.public_token;

      // exchange the public token for an access token
      const exchangeResponse = await fetch(API + "/exchange-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_token: publicToken }),
      });
      const exchangeData = await exchangeResponse.json();
      const newAccessToken = exchangeData.access_token;

      // Save the access token in state so other functions can use it
      setAccessToken(newAccessToken);

      Alert.alert("Linked", "Sandbox account connected.");
    } catch (error) {
      Alert.alert("Error", String(error));
    }
  }


  // Handler tofetch balances. Runs when the user taps "Refresh Balances".
  async function fetchBalances() {
    const url = API + "/balances?access_token=" + accessToken;
    const response = await fetch(url);
    const data = await response.json();

    // data.accounts is an array of account objects from Plaid
    setAccounts(data.accounts);
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* The green header block showing total balance.
            We pass in the accounts array so it can do the math. */}
        <SummaryBlock accounts={accounts} />

        {/* The button area below the header */}
        <View style={styles.buttonArea}>
          <Button
            title="Link Sandbox Account"
            onPress={linkAccount}
          />

          {/* Only show "Refresh Balances" AFTER we have an access token.
              Before linking, this button would fail because there's no token. */}
          {accessToken !== null && (
            <View>
              <View style={{ height: 10 }} />
              <Button
                title="Refresh Balances"
                onPress={fetchBalances}
              />
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryBlock(props) {
  const accounts = props.accounts || [];

  // Calculate the total balance 
  // Loop through each account and add its balance to a running total
  let total = 0;
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    
    let balance = 0;
    if (account.available !== null && account.available !== undefined) {
      balance = account.available;
    } else if (account.current !== null && account.current !== undefined) {
      balance = account.current;
    } else {
      balance = 0;
    }

    total = total + balance;
  }

  // Format the total as US currency
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const formattedTotal = formatter.format(total);

  return (
    <View style={styles.topBlock}>
      <Text style={styles.blockLabel}>Total Balance</Text>
      <Text style={styles.blockAmount}>{formattedTotal}</Text>
    </View>
  );
}


// Styling 
const styles = StyleSheet.create({
  // Fills the whole screen with a light grey background
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // ScrollView's inner content area
  content: {
    paddingBottom: 20,
  },

  // The green header block at the top
  topBlock: {
    height: 200,
    backgroundColor: "#009e2a",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // Shadow on Android
    elevation: 5,
    // Shadow on iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  // The small label inside the header
  blockLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 14,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },

  // The big dollar amount inside the header
  blockAmount: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "700",
  },

  // Wrapper around the buttons below the header
  buttonArea: {
    padding: 20,
  },
});