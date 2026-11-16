// File: Assistant.js
// This is the assistant screen, a chat with suggested questions. The answers are canned for now, nothing is sent anywhere

import { useState, useEffect, useRef } from "react";
import { View, ScrollView, TextInput, TouchableOpacity, Text, Keyboard, Platform, StyleSheet } from "react-native";

import AppText from "../../components/AppText";
import Icon from "../../components/Icon";
import { useTabBarHeight } from "../../components/TabBar";
import { useSettings } from "../../context/SettingsContext";
import { shadow } from "../../theme";
import { assistantHello, assistantFallback, assistantQuestions } from "../../data/sampleData";

// the chat always starts with the hello message from the assistant
const FIRST_MESSAGE = { from: "ai", text: assistantHello };

export default function Assistant() {
  const { colors, fontScale } = useSettings();
  const [messages, setMessages] = useState([FIRST_MESSAGE]); // each one is { from: "ai" or "me", text }
  const [text, setText] = useState(""); // what is typed in the box
  const [keyboardSpace, setKeyboardSpace] = useState(0);
  const scroll = useRef(null);
  const tabBarHeight = useTabBarHeight();
  const answerTimer = useRef(null); // the wait before the assistant answers, kept so it can be cancelled

  // on ios the keyboard covers the bottom of the screen, so the text box gets pushed up by the keyboard height
  // (minus the tab bar, since that is under the text box and gets covered anyway)
  useEffect(() => {
    if (Platform.OS !== "ios") return; // android moves the screen up by itself

    const show = Keyboard.addListener("keyboardWillShow", (event) => {
      setKeyboardSpace(Math.max(0, event.endCoordinates.height - tabBarHeight));
    });
    const hide = Keyboard.addListener("keyboardWillHide", () => setKeyboardSpace(0));

    // stop listening when the screen goes away
    return () => {
      show.remove();
      hide.remove();
    };
  }, [tabBarHeight]);

  // if the screen goes away while an answer is still on its way, cancel it
  useEffect(() => {
    return () => clearTimeout(answerTimer.current);
  }, []);

  // adds the question to the chat, then the answer half a second later
  // this is where the real call to the assistant will go
  const ask = (question) => {
    setMessages((current) => [...current, { from: "me", text: question }]);

    const match = assistantQuestions.find((item) => item.question === question);
    const answer = match ? match.answer : assistantFallback;
    answerTimer.current = setTimeout(() => {
      setMessages((current) => [...current, { from: "ai", text: answer }]);
    }, 500);
  };

  // runs when the send button is tapped
  const handleSend = () => {
    const question = text.trim();
    if (!question) return; // nothing to send
    setText("");
    ask(question);
  };

  // wipes the chat back to just the hello message
  const handleClear = () => {
    clearTimeout(answerTimer.current); // so an answer does not show up after the chat was cleared
    setMessages([FIRST_MESSAGE]);
  };

  return (
    <View style={[styles.container, { paddingBottom: keyboardSpace }]}>
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        // keep the newest message in view
        onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
      >
        <TouchableOpacity style={styles.clear} onPress={handleClear}>
          <AppText variant="meta" color={colors.green} style={styles.clearText}>Clear</AppText>
        </TouchableOpacity>

        {/* the chat bubbles, mine are green on the right and the assistant is on the left */}
        {messages.map((message, index) => {
          const mine = message.from === "me";
          return (
            <View
              key={index}
              style={[
                styles.bubble,
                mine ? styles.myBubble : styles.aiBubble,
                { backgroundColor: mine ? colors.green : colors.card },
              ]}
            >
              <AppText style={styles.bubbleText} color={mine ? "#fff" : colors.text}>{message.text}</AppText>
            </View>
          );
        })}

        {/* suggested questions, tapping one asks it */}
        <View style={styles.prompts}>
          {assistantQuestions.map((item) => (
            <TouchableOpacity
              key={item.question}
              style={[styles.prompt, { borderColor: colors.green }]}
              onPress={() => ask(item.question)}
            >
              <AppText variant="meta" style={styles.promptText} color={colors.green}>{item.question}</AppText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.privacyLine}>
          <Icon name="lock" size={14} color={colors.muted} />
          <AppText variant="meta" style={styles.privacy}>
            The assistant only sees your Sprout summaries, never your bank login or account numbers.
          </AppText>
        </View>
      </ScrollView>

      {/* the text box and send button along the bottom */}
      <View style={[styles.composer, { backgroundColor: colors.card, borderTopColor: colors.line }]}>
        <TextInput
          style={[styles.box, { backgroundColor: colors.input, color: colors.text, fontSize: 15 * fontScale }]}
          placeholder="Ask about your finances"
          placeholderTextColor={colors.muted}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity style={[styles.send, { backgroundColor: colors.green }]} onPress={handleSend}>
          <Text style={styles.sendArrow}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- STYLING:
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
  },

  clear: { // sits on the right above the chat
    alignSelf: "flex-end",
    paddingBottom: 8,
    paddingLeft: 16,
  },

  clearText: {
    marginTop: 0,
    fontWeight: "600",
  },

  bubble: {
    maxWidth: "82%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 10,
  },

  aiBubble: { // left side, with the bottom left corner squared off
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    ...shadow,
  },

  myBubble: { // right side, with the bottom right corner squared off
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },

  bubbleText: {
    lineHeight: 21,
  },

  prompts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 14,
  },

  prompt: { // outlined pill for each suggested question
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  promptText: {
    marginTop: 0,
  },

  privacyLine: { // small lock next to the privacy note
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
  },

  privacy: {
    flexShrink: 1,
    marginTop: 0,
  },

  composer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },

  box: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
  },

  send: { // round green send button
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  sendArrow: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
