// File: Calendar.js
// This is the month calendar used on the spending, debt and bills screens, each screen decides what goes under the day numbers

import { View, TouchableOpacity, StyleSheet } from "react-native";

import AppText from "./AppText";
import { useSettings } from "../context/SettingsContext";
import { currentMonth } from "../data/sampleData";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// selectedDay - the day number that is picked, or null
// onSelectDay - called with the day that was tapped (or null when the picked day is tapped again)
// renderDay   - optional function, gets (day, isSelected) and returns what to draw under the number (an amount, dots...)
export default function Calendar({ selectedDay, onSelectDay, renderDay }) {
  const { colors } = useSettings();
  const { year, month, name, today } = currentMonth;

  // which weekday the 1st lands on (0 = sunday) and how many days the month has
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  // one entry per box in the grid, null for the empty boxes before the 1st
  const boxes = [];
  for (let i = 0; i < firstWeekday; i++) {
    boxes.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    boxes.push(day);
  }

  return (
    <View>
      <AppText variant="title" style={styles.title}>{name} {year}</AppText>

      {/* the S M T W T F S line */}
      <View style={styles.grid}>
        {WEEKDAYS.map((letter, index) => (
          <View key={index} style={styles.box}>
            <AppText variant="tiny" color={colors.muted} style={styles.weekday}>{letter}</AppText>
          </View>
        ))}
      </View>

      {/* the days, 7 to a line because every box is one seventh of the width */}
      <View style={styles.grid}>
        {boxes.map((day, index) => {
          if (day === null) {
            return <View key={index} style={styles.box} />;
          }

          const selected = day === selectedDay;
          return (
            <TouchableOpacity
              key={index}
              style={styles.box}
              onPress={() => onSelectDay(selected ? null : day)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={name + " " + day} // "November 18" instead of just "18"
              accessibilityState={{ selected }}
            >
              <View
                style={[
                  styles.day,
                  { backgroundColor: selected ? colors.green : colors.bg },
                  // today gets a green outline
                  { borderColor: day === today ? colors.green : "transparent" },
                ]}
              >
                <AppText variant="meta" style={styles.dayNumber} color={selected ? "#fff" : colors.text}>
                  {day}
                </AppText>
                {renderDay ? renderDay(day, selected) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  title: {
    marginBottom: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  box: { // one seventh of the row, the padding is the gap between days
    width: "14.28%",
    padding: 2,
  },

  weekday: {
    textAlign: "center",
    paddingBottom: 2,
  },

  day: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 2,
    paddingTop: 3,
    alignItems: "center",
  },

  dayNumber: {
    marginTop: 0,
  },
});
