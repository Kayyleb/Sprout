// File: Home.js
// This is the home screen, the page the user lands on after logging in

import { View, ScrollView, StyleSheet } from "react-native";

import AppText from "../../components/AppText";
import Card from "../../components/Card";
import Icon from "../../components/Icon";
import SectionTitle from "../../components/SectionTitle";
import { useSettings } from "../../context/SettingsContext";
import { money, total, dayOf } from "../../utils/format";
import {
  currentMonth,
  purchases,
  deposits,
  savingsAccounts,
  investmentAccounts,
  debts,
  bills,
} from "../../data/sampleData";

export default function Home({ navigation }) {
  const { colors, hideValues } = useSettings();

  // add everything up from the sample data, this is what the backend summaries will replace
  const spent = total(purchases, "amount");
  const income = total(deposits, "amount");
  const savings = total(savingsAccounts, "balance") + total(investmentAccounts, "balance");
  const debt = total(debts, "balance");
  const billsTotal = total(bills, "amount");
  const billsPaid = total(bills.filter((bill) => bill.paid), "amount");

  // how many days until the closest debt payment that has not gone by yet
  const daysUntilDue = debts
    .map((item) => dayOf(item.dueDate) - currentMonth.today)
    .filter((days) => days >= 0);
  const dueHint =
    daysUntilDue.length > 0
      ? "next payment due in " + Math.min(...daysUntilDue) + " days"
      : "no more payments due this month";

  // writes out an amount, or dots when "hide account values" is turned on in settings
  const show = (amount) => (hideValues ? "••••" : money(amount));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle>{currentMonth.name} {currentMonth.year}</SectionTitle>

      {/* the two large summaries at the top */}
      <View style={styles.topRow}>
        <Card style={styles.topCard} onPress={() => navigation.navigate("Spending")}>
          <AppText variant="label">Monthly Spending</AppText>
          <AppText variant="amount" color={colors.red} numberOfLines={1} adjustsFontSizeToFit>
            {show(spent)}
          </AppText>
          <AppText variant="meta">{currentMonth.today} days so far ›</AppText>
        </Card>

        <Card style={styles.topCard} onPress={() => navigation.navigate("Income")}>
          <AppText variant="label">Monthly Income</AppText>
          <AppText variant="amount" color={colors.green} numberOfLines={1} adjustsFontSizeToFit>
            {show(income)}
          </AppText>
          <AppText variant="meta">{deposits.length} deposits ›</AppText>
        </Card>
      </View>

      {/* the smaller cards underneath, each one opens its own screen */}
      <SummaryCard
        icon="savings"
        label="Total Savings"
        amount={show(savings)}
        hint={savingsAccounts.length + investmentAccounts.length + " accounts"}
        onPress={() => navigation.navigate("Savings")}
      />

      <SummaryCard
        icon="debt"
        label="Debt Breakdown"
        amount={show(debt)}
        hint={debts.length + " debts · " + dueHint}
        onPress={() => navigation.navigate("Debt")}
      />

      <SummaryCard
        icon="bills"
        label="Bills"
        amount={show(billsTotal)}
        hint={show(billsPaid) + " paid so far this month"}
        progress={billsPaid / billsTotal}
        onPress={() => navigation.navigate("Bills")}
      />
    </ScrollView>
  );
}

// one of the wide cards on the home screen, an icon on the left, the numbers in the middle and an arrow on the right
// progress is optional (0 to 1), the bills card uses it to draw the paid so far bar
function SummaryCard({ icon, label, amount, hint, progress, onPress }) {
  const { colors } = useSettings();

  return (
    <Card style={styles.summaryCard} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: colors.greenSoft }]}>
        <Icon name={icon} size={24} color={colors.green} />
      </View>

      <View style={styles.summaryText}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="amount">{amount}</AppText>
        <AppText variant="meta">{hint}</AppText>

        {progress !== undefined && (
          <View style={[styles.bar, { backgroundColor: colors.line }]}>
            <View style={[styles.barFill, { backgroundColor: colors.green, width: progress * 100 + "%" }]} />
          </View>
        )}
      </View>

      <AppText style={styles.arrow} color={colors.muted}>›</AppText>
    </Card>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  content: { // the scrolling area
    padding: 16,
    paddingBottom: 24,
  },

  topRow: { // spending and income side by side
    flexDirection: "row",
    gap: 12,
  },

  topCard: {
    flex: 1,
  },

  summaryCard: { // lines the icon, text and arrow up in a row
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconBox: { // soft green square behind the icon
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryText: {
    flex: 1,
  },

  arrow: {
    fontSize: 22,
  },

  bar: { // grey track of the progress bar
    height: 8,
    borderRadius: 4,
    marginTop: 10,
    overflow: "hidden",
  },

  barFill: { // green part, its width is set from how much has been paid
    height: "100%",
    borderRadius: 4,
  },
});
