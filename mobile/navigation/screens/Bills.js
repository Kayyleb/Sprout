// File: Bills.js
// This is the bills screen, every bill on a calendar with a colored dot for the kind of bill it is, and a list underneath

import { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";

import AppText from "../../components/AppText";
import Button from "../../components/Button";
import Calendar from "../../components/Calendar";
import Card from "../../components/Card";
import Choices from "../../components/Choices";
import Hero from "../../components/Hero";
import Input from "../../components/Input";
import Row from "../../components/Row";
import { useSettings } from "../../context/SettingsContext";
import { money, total, dayOf, inMonth, formatDate, parseDate, datePlaceholder } from "../../utils/format";
import { currentMonth, bills, billColors } from "../../data/sampleData";

// the bill categories as a list, for the legend and for the pills on the add form
const CATEGORIES = Object.keys(billColors);
const CATEGORY_OPTIONS = CATEGORIES.map((name) => ({ label: name, value: name }));

export default function Bills() {
  const { colors, dateOrder } = useSettings();
  const [items, setItems] = useState(bills); // starts as the sample bills, the add form puts new ones on the end
  const [selectedDay, setSelectedDay] = useState(null); // the day tapped on the calendar
  const [formOpen, setFormOpen] = useState(false);

  // the boxes on the add bill form
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Subscription");
  const [timesPerYear, setTimesPerYear] = useState("");

  // only the bills due this month are shown
  const monthItems = items.filter((item) => inMonth(item.date, currentMonth));
  const billsTotal = total(monthItems, "amount");
  const paid = total(monthItems.filter((item) => item.paid), "amount");

  // the bills due on one day of the month
  const billsOn = (day) => monthItems.filter((item) => dayOf(item.date) === day);

  // the list shows every bill, or only the ones due on the day that was tapped
  const shown = selectedDay ? billsOn(selectedDay) : monthItems;

  // runs when the user taps Save on the add bill form
  // nothing is sent to the backend yet, it only gets added to the list on this screen
  const handleSave = () => {
    const number = Number(amount);
    const isoDate = parseDate(date, dateOrder);
    if (!name || !number || number <= 0) {
      Alert.alert("Error", "Enter a name and an amount for the bill.");
      return;
    }
    if (!isoDate) {
      Alert.alert("Error", "Enter the date like this: " + datePlaceholder(dateOrder));
      return;
    }

    const newBill = {
      date: isoDate,
      name: name,
      amount: number,
      category: category,
      timesPerYear: Number(timesPerYear) || 12, // left empty counts as monthly
      paid: false,
    };
    setItems([...items, newBill]);

    // clear the form and close it
    setName("");
    setAmount("");
    setDate("");
    setTimesPerYear("");
    setFormOpen(false);
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets={true}>
      <Hero
        label={"Bills in " + currentMonth.name}
        amount={money(billsTotal)}
        sub={money(paid) + " paid · " + money(billsTotal - paid) + " still to go"}
      />

      <View style={styles.content}>
        <Card>
          <Calendar
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            renderDay={(day) => (
              // one dot per bill due that day, colored by its category
              <View style={styles.dots}>
                {billsOn(day).map((bill, index) => (
                  <View key={index} style={[styles.dot, { backgroundColor: billColors[bill.category] }]} />
                ))}
              </View>
            )}
          />

          {/* which color is which kind of bill */}
          <View style={styles.legend}>
            {CATEGORIES.map((name) => (
              <View key={name} style={styles.legendItem}>
                <View style={[styles.dot, styles.legendDot, { backgroundColor: billColors[name] }]} />
                <AppText variant="meta" style={styles.noMargin}>{name}</AppText>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <AppText variant="title" style={styles.cardTitle}>
            {selectedDay ? "Due " + currentMonth.name + " " + selectedDay : "All bills"}
          </AppText>

          {shown.length === 0 && <AppText variant="meta">No bills due on this day.</AppText>}

          {shown.map((bill, index) => (
            <Row
              key={index}
              first={index === 0}
              dot={billColors[bill.category]}
              name={bill.name}
              meta={bill.category + " · due " + formatDate(bill.date, dateOrder)}
              right={
                <View style={styles.billRight}>
                  <AppText variant="name">{money(bill.amount)}</AppText>
                  {/* green pill for paid bills, outlined grey pill for the ones still coming */}
                  <View
                    style={[
                      styles.pill,
                      bill.paid
                        ? { backgroundColor: colors.greenSoft, borderColor: colors.greenSoft }
                        : { borderColor: colors.line },
                    ]}
                  >
                    <AppText variant="tiny" style={styles.pillText} color={bill.paid ? colors.green : colors.muted}>
                      {bill.paid ? "Paid" : "Upcoming"}
                    </AppText>
                  </View>
                </View>
              }
            />
          ))}
        </Card>

        <Button title="+ Add Bill" variant="ghost" onPress={() => setFormOpen(!formOpen)} />
        {formOpen && (
          <Card style={styles.form}>
            <Input placeholder="Bill name" value={name} onChangeText={setName} autoCapitalize="words" />
            <Input placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <Input placeholder={datePlaceholder(dateOrder)} value={date} onChangeText={setDate} />
            <Choices options={CATEGORY_OPTIONS} value={category} onChange={setCategory} style={styles.choices} />
            <Input
              placeholder="Times per year (12 = monthly)"
              value={timesPerYear}
              onChangeText={setTimesPerYear}
              keyboardType="number-pad"
            />
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

  dots: { // the row of dots under a day number
    flexDirection: "row",
    justifyContent: "center",
    gap: 2,
    marginTop: 5,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 4,
    marginTop: 12,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    marginRight: 5,
  },

  noMargin: {
    marginTop: 0,
  },

  billRight: { // amount with the paid / upcoming pill under it
    alignItems: "flex-end",
  },

  pill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginTop: 3,
  },

  pillText: {
    fontWeight: "600",
  },

  form: { // the add form sits right under its button
    marginTop: 12,
  },

  choices: {
    marginBottom: 14,
  },
});
