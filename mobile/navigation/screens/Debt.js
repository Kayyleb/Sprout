// File: Debt.js
// This is the debt screen, every debt, the payoff plan from the assistant, and a calendar of when payments are due

import { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";

import AppText from "../../components/AppText";
import Button from "../../components/Button";
import Calendar from "../../components/Calendar";
import Card from "../../components/Card";
import Hero from "../../components/Hero";
import Icon from "../../components/Icon";
import Input from "../../components/Input";
import Row from "../../components/Row";
import SectionTitle from "../../components/SectionTitle";
import { useSettings } from "../../context/SettingsContext";
import { money, total, dayOf, inMonth, formatDate, parseDate, datePlaceholder, plural } from "../../utils/format";
import { currentMonth, debts, payoffPlan, deposits, bills } from "../../data/sampleData";

export default function Debt() {
  const { colors, dateOrder } = useSettings();
  const [items, setItems] = useState(debts); // starts as the sample debts, the add form puts new ones on the end
  const [selectedDay, setSelectedDay] = useState(null); // the day tapped on the payment calendar
  const [formOpen, setFormOpen] = useState(false);

  // the boxes on the add debt form
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [apr, setApr] = useState("");
  const [minimum, setMinimum] = useState("");
  const [dueDate, setDueDate] = useState("");

  const debtTotal = total(items, "balance");
  const minimumTotal = total(items, "minimum");
  const planTotal = total(payoffPlan.steps, "monthly");
  const netIncome = total(deposits, "amount") - total(bills, "amount");

  // the debts with a payment due on one day of this month
  const dueOn = (day) => items.filter((item) => inMonth(item.dueDate, currentMonth) && dayOf(item.dueDate) === day);

  // the line under the calendar, changes when a day is tapped
  let dueNote = "You get a reminder 3 days before each payment is due.";
  if (selectedDay) {
    const due = dueOn(selectedDay);
    if (due.length === 0) {
      dueNote = "Nothing due on " + currentMonth.name + " " + selectedDay + ".";
    } else {
      dueNote = due
        .map((item) => item.name + " · minimum " + money(item.minimum) + " due " + currentMonth.name + " " + selectedDay)
        .join("\n");
    }
  }

  // runs when the user taps Save on the add debt form
  // nothing is sent to the backend yet, it only gets added to the list on this screen
  const handleSave = () => {
    const number = Number(balance);
    const isoDate = parseDate(dueDate, dateOrder);
    if (!name || !number || number <= 0) {
      Alert.alert("Error", "Enter a name and a balance for the debt.");
      return;
    }
    if (!isoDate) {
      Alert.alert("Error", "Enter the due date like this: " + datePlaceholder(dateOrder));
      return;
    }

    const newDebt = {
      name: name,
      balance: number,
      apr: Number(apr) || 0, // left empty counts as 0
      minimum: Number(minimum) || 0,
      dueDate: isoDate,
    };
    setItems([...items, newDebt]);

    // clear the form and close it
    setName("");
    setBalance("");
    setApr("");
    setMinimum("");
    setDueDate("");
    setFormOpen(false);
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets={true}>
      <Hero
        label="Total Debt"
        amount={money(debtTotal)}
        sub={plural(items.length, "debt") + " · " + money(minimumTotal) + " in minimum payments"}
        color={colors.debt}
      />

      <View style={styles.content}>
        <SectionTitle>Where it comes from</SectionTitle>
        <Card>
          {items.map((item, index) => (
            <Row
              key={index}
              first={index === 0}
              name={item.name}
              meta={item.apr + "% APR · min " + money(item.minimum) + " · due " + formatDate(item.dueDate, dateOrder)}
              value={money(item.balance)}
            />
          ))}
        </Card>

        {/* the plan is sample text for now, later the assistant will build it from the real debts */}
        <SectionTitle>Your payoff plan</SectionTitle>
        <Card>
          <View style={styles.planTitle}>
            <Icon name="sparkle" size={18} color={colors.green} />
            <AppText variant="title">Built by the Sprout assistant</AppText>
          </View>
          <AppText variant="meta" style={styles.strategy}>{payoffPlan.strategy}</AppText>

          {payoffPlan.steps.map((step, index) => (
            <Row
              key={step.name}
              first={index === 0}
              name={index + 1 + ". " + step.name}
              meta={"Paid off around " + step.paidOff}
              value={money(step.monthly) + " / mo"}
            />
          ))}
          <Row name="Total each month" value={money(planTotal)} />

          <AppText variant="meta">
            Estimated debt free: {payoffPlan.debtFree} · fits inside your {money(netIncome)} net income
          </AppText>
        </Card>

        <SectionTitle>Payment calendar</SectionTitle>
        <Card>
          <Calendar
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            renderDay={(day, selected) => {
              // a red dot on the days a payment is due
              if (dueOn(day).length === 0) return null;
              return <View style={[styles.dot, { backgroundColor: selected ? "#fff" : colors.red }]} />;
            }}
          />
          <AppText variant="meta" style={styles.dueNote}>{dueNote}</AppText>
        </Card>

        <Button title="+ Add Debt" variant="ghost" onPress={() => setFormOpen(!formOpen)} />
        {formOpen && (
          <Card style={styles.form}>
            <Input placeholder="Name" value={name} onChangeText={setName} autoCapitalize="words" />
            <Input placeholder="Balance" value={balance} onChangeText={setBalance} keyboardType="decimal-pad" />
            <Input placeholder="Interest rate (APR %)" value={apr} onChangeText={setApr} keyboardType="decimal-pad" />
            <Input placeholder="Minimum payment" value={minimum} onChangeText={setMinimum} keyboardType="decimal-pad" />
            <Input placeholder={"Due " + datePlaceholder(dateOrder).replace("Date", "date")} value={dueDate} onChangeText={setDueDate} />
            <Button title="Save" small onPress={handleSave} />
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  content: { // everything under the red header
    padding: 16,
    paddingBottom: 32,
  },

  planTitle: { // sparkle icon next to the title of the plan
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  strategy: { // the paragraph explaining the plan
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 19,
  },

  dot: { // payment due marker on the calendar
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },

  dueNote: {
    marginTop: 10,
  },

  form: { // the add form sits right under its button
    marginTop: 12,
  },
});
