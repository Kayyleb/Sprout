// File: Income.js
// This is the income screen, it shows the income for each week by deposit type and the net income after bills

import { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";

import AppText from "../../components/AppText";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Choices from "../../components/Choices";
import Hero from "../../components/Hero";
import Input from "../../components/Input";
import Row from "../../components/Row";
import { useSettings } from "../../context/SettingsContext";
import { money, total, dayOf, inMonth, parseDate, datePlaceholder, plural } from "../../utils/format";
import { currentMonth, deposits, depositTypes, incomeWeeks, bills } from "../../data/sampleData";

// the deposit types as a list for the pills on the add form
const TYPE_OPTIONS = Object.keys(depositTypes).map((key) => ({
  label: depositTypes[key].label,
  value: key,
}));

export default function Income() {
  const { colors, dateOrder } = useSettings();
  const [items, setItems] = useState(deposits); // starts as the sample deposits, the add form puts new ones on the end
  const [formOpen, setFormOpen] = useState(false);

  // the boxes on the add income form
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("direct");

  // only this month's deposits are counted
  const monthItems = items.filter((item) => inMonth(item.date, currentMonth));
  const income = total(monthItems, "amount");
  const billsTotal = total(bills, "amount");

  // sort the deposits into their weeks and add each week up
  const weeks = incomeWeeks.map((week) => {
    const weekItems = monthItems.filter((item) => {
      const day = dayOf(item.date);
      return day >= week.firstDay && day <= week.lastDay;
    });
    return { ...week, items: weekItems, total: total(weekItems, "amount") };
  });

  // the largest week, so every bar is drawn against the same scale
  const biggest = Math.max(...weeks.map((week) => week.total), 1);
  const weeksWithIncome = weeks.filter((week) => week.total > 0).length;

  // runs when the user taps Save on the add income form
  // nothing is sent to the backend yet, it only gets added to the list on this screen
  const handleSave = () => {
    const number = Number(amount);
    const isoDate = parseDate(date, dateOrder);
    if (!number || number <= 0) {
      Alert.alert("Error", "Enter the amount you received.");
      return;
    }
    if (!isoDate) {
      Alert.alert("Error", "Enter the date like this: " + datePlaceholder(dateOrder));
      return;
    }

    setItems([...items, { date: isoDate, type: type, amount: number }]);

    // clear the form and close it
    setAmount("");
    setDate("");
    setFormOpen(false);
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets={true}>
      <Hero
        label={"Income in " + currentMonth.name}
        amount={money(income)}
        sub={plural(monthItems.length, "deposit") + " across " + plural(weeksWithIncome, "week")}
      />

      <View style={styles.content}>
        <Card>
          <AppText variant="title" style={styles.cardTitle}>Weekly breakdown</AppText>

          {weeks.map((week) => (
            <View key={week.name} style={styles.week}>
              <View style={styles.weekHead}>
                <AppText variant="name">
                  {week.name} · {currentMonth.shortName} {week.firstDay} – {week.lastDay}
                </AppText>
                <AppText variant="name">{money(week.total)}</AppText>
              </View>

              {/* one colored piece per deposit, as wide as its share of the biggest week */}
              <View style={[styles.bar, { backgroundColor: colors.line }]}>
                {week.items.map((item, index) => (
                  <View
                    key={index}
                    style={{
                      width: (item.amount / biggest) * 100 + "%",
                      backgroundColor: depositTypes[item.type].color,
                    }}
                  />
                ))}
              </View>

              <AppText variant="meta">
                {week.items.length === 0
                  ? "Nothing yet"
                  : week.items.map((item) => depositTypes[item.type].label + " " + money(item.amount)).join(" · ")}
              </AppText>
            </View>
          ))}

          {/* which color is which deposit type */}
          <View style={styles.legend}>
            {TYPE_OPTIONS.map((option) => (
              <View key={option.value} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: depositTypes[option.value].color }]} />
                <AppText variant="meta" style={styles.legendText}>{option.label}</AppText>
              </View>
            ))}
          </View>
        </Card>

        {/* net income is the income minus the monthly bills */}
        <Card>
          <AppText variant="title" style={styles.cardTitle}>Monthly net income</AppText>
          <Row first name="Total income" value={money(income)} valueColor={colors.green} />
          <Row name="Monthly bills" value={"− " + money(billsTotal)} valueColor={colors.red} />
          <Row name="Net income" value={money(income - billsTotal)} />
        </Card>

        <Button title="+ Add Income" variant="ghost" onPress={() => setFormOpen(!formOpen)} />
        {formOpen && (
          <Card style={styles.form}>
            <Input placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <Input placeholder={datePlaceholder(dateOrder)} value={date} onChangeText={setDate} />
            <Choices options={TYPE_OPTIONS} value={type} onChange={setType} style={styles.choices} />
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

  cardTitle: {
    marginBottom: 10,
  },

  week: {
    marginBottom: 14,
  },

  weekHead: { // week name on the left, its total on the right
    flexDirection: "row",
    justifyContent: "space-between",
  },

  bar: { // grey track the colored pieces sit in
    flexDirection: "row",
    height: 14,
    borderRadius: 7,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 2,
  },

  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 4,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendText: {
    marginTop: 0,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },

  form: { // the add form sits right under its button
    marginTop: 12,
  },

  choices: {
    marginBottom: 14,
  },
});
