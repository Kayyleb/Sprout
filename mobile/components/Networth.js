import { View, Text, StyleSheet } from 'react-native';

// formats a number as US currency, used for the big total and for each row
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

// net worth card, shows the total and a breakdown underneath it
// not on the home screen yet, Home.js is using its own SummaryBlock for now
export default function Networth({ accounts = [] }) {
  // summarize all the available balances across the plaid accounts
  const bankTotal = accounts.reduce((sum, a) => {
    const value = a.available ?? a.current ?? 0;
    return sum + value;
  }, 0);

  // nothing to pull these from yet, so they stay at 0 for now
  const investmentsTotal = 0;
  const otherAssetsTotal = 0;

  const networth = bankTotal + investmentsTotal + otherAssetsTotal;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Net Worth</Text>
      <Text style={styles.amount}>{currency.format(networth)}</Text>

      <View style={styles.breakdown}>
        <Row label="Cash & Bank" value={bankTotal} />
        <Row label="Investments" value={investmentsTotal} />
        <Row label="Other Assets" value={otherAssetsTotal} />
      </View>
    </View>
  );
}

// one line of the breakdown, label on the left and the amount on the right
function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{currency.format(value)}</Text>
    </View>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  card: { // the green card itself
    backgroundColor: '#009e2a',      // matches the Sign In button
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    // Subtle shadow (works on iOS; Android uses `elevation`)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  label: { // small "Net Worth" label at the top
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  amount: { // the big dollar amount
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 16,
  },
  breakdown: { // section under the total, split off with a thin line
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
    gap: 6,
  },
  row: { // label on the left, amount on the right
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  rowValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
