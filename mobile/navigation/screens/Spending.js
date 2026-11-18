// File: Spending.js
// This is the spending screen, a calendar with the amount spent each day, tapping a day lists that day's purchases

import { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";

import AppText from "../../components/AppText";
import Button from "../../components/Button";
import Calendar from "../../components/Calendar";
import Card from "../../components/Card";
import Hero from "../../components/Hero";
import Input from "../../components/Input";
import Row from "../../components/Row";
import { useSettings } from "../../context/SettingsContext";
import { money, parseAmount, total, dayOf, inMonth, parseDate, datePlaceholder } from "../../utils/format";
import { currentMonth, purchases } from "../../data/sampleData";

export default function Spending() {
  const { colors, dateOrder } = useSettings();
  const [items, setItems] = useState(purchases); // starts as the sample purchases, the add form puts new ones on the end
  const [selectedDay, setSelectedDay] = useState(null); // the day tapped on the calendar
  const [formOpen, setFormOpen] = useState(false);

  // the three boxes on the add spending form
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  // only this month's purchases count towards the total and the calendar
  const monthItems = items.filter((item) => inMonth(item.date, currentMonth));
  const spent = total(monthItems, "amount");

  // every purchase made on one day of the month
  const purchasesOn = (day) => monthItems.filter((item) => dayOf(item.date) === day);
  const dayItems = selectedDay ? purchasesOn(selectedDay) : [];

  // runs when the user taps Save on the add spending form
  // nothing is sent to the backend yet, it only gets added to the list on this screen
  const handleSave = () => {
    const number = parseAmount(amount);
    const isoDate = parseDate(date, dateOrder);
    if (!number) { // empty, not a number, or zero
      Alert.alert("Error", "Enter the amount you spent.");
      return;
    }
    if (!isoDate) {
      Alert.alert("Error", "Enter the date like this: " + datePlaceholder(dateOrder));
      return;
    }

    const newItem = {
      date: isoDate,
      name: description.trim() || "Purchase",
      account: "Added manually",
      amount: number,
    };
    setItems([...items, newItem]);
    // only this month is shown, so say so instead of the new one seeming to vanish
    if (!inMonth(isoDate, currentMonth)) {
      Alert.alert("Saved", "That date is not in " + currentMonth.name + ", so it does not show on this screen.");
    }

    // clear the form and close it
    setAmount("");
    setDate("");
    setDescription("");
    setFormOpen(false);
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets={true}>
      <Hero
        label={"Spent in " + currentMonth.name}
        amount={money(spent)}
        sub="Bills, debt payments and savings transfers are not counted"
      />

      <View style={styles.content}>
        <Card>
          <Calendar
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            renderDay={(day, selected) => {
              // the rounded amount spent that day, nothing on days with no spending
              const dayTotal = total(purchasesOn(day), "amount");
              if (dayTotal === 0) return null;
              return (
                <AppText variant="tiny" color={selected ? "#fff" : colors.red}>
                  ${Math.round(dayTotal)}
                </AppText>
              );
            }}
          />
        </Card>

        {/* the purchases for the day that was tapped */}
        <Card>
          <AppText variant="title" style={styles.cardTitle}>
            {selectedDay
              ? currentMonth.name + " " + selectedDay + " · " + money(total(dayItems, "amount"))
              : "Tap a day to see its purchases"}
          </AppText>

          {selectedDay && dayItems.length === 0 ? (
            <AppText variant="meta">No purchases on this day.</AppText>
          ) : null}

          {dayItems.map((item, index) => (
            <Row
              key={index}
              first={index === 0}
              name={item.name}
              meta={item.account}
              value={money(item.amount)}
              valueColor={colors.red}
            />
          ))}
        </Card>

        {/* manual entry, for cash or when no bank is linked */}
        <Button title="+ Add Spending" variant="ghost" onPress={() => setFormOpen(!formOpen)} />
        {formOpen && (
          <Card style={styles.form}>
            <Input placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <Input placeholder={datePlaceholder(dateOrder)} value={date} onChangeText={setDate} />
            <Input placeholder="Description" value={description} onChangeText={setDescription} autoCapitalize="sentences" />
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

  form: { // the add form sits right under its button
    marginTop: 12,
  },
});
