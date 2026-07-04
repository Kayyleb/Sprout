import {View , Text , StyleSheet} from 'react-native'

export default function Networth({accounts = []}) {
    // summarize all the available balances across the plaid accounts
    const totall = accounts.reduce((sum , a) => {
        const val = a.available ?? a.current ?? 0;
        return sum + value;
    }, 0);

    const investments = 0;
    const other = 0;

    const networth = totall + investments + other;

    const format = new Intl.NumberFormat('en-US' , {
        style: 'currency',
        currency: 'USD',
    }).format(networth)

    function Row({ label, value }) {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{formatted}</Text>
    </View>
  );
}

    return (
    <View style={styles.card}>
      <Text style={styles.label}>Net Worth</Text>
      <Text style={styles.amount}>{formatted}</Text>

      <View style={styles.breakdown}>
        <Row label="Cash & Bank" value={bankTotal} />
        <Row label="Investments" value={investmentsTotal} />
        <Row label="Other Assets" value={otherAssetsTotal} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#009e2a',      // matches your Sign In button
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
  label: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  amount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 16,
  },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
    gap: 6,
  },
  row: {
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