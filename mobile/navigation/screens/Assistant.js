// File: Assistant.js
// This is the assistant screen, a chat with suggested questions. Questions go to the backend, which asks the AI (see api.js)

import { useState, useEffect, useRef } from "react";
import { View, ScrollView, TextInput, TouchableOpacity, Text, Keyboard, Platform, ActivityIndicator, StyleSheet } from "react-native";

import AppText from "../../components/AppText";
import Icon from "../../components/Icon";
import { useTabBarHeight } from "../../components/TabBar";
import { useSettings } from "../../context/SettingsContext";
import { shadow } from "../../theme";
import { assistantHello, assistantQuestions } from "../../data/sampleData";
import { askAssistant } from "../../api";
import { buildSummary } from "../../utils/summary";

// the chat always starts with the hello message from the assistant
const FIRST_MESSAGE = { from: "ai", text: assistantHello };

export default function Assistant() {
  const { colors, fontScale } = useSettings();
  const [messages, setMessages] = useState([FIRST_MESSAGE]); // each one is { from: "ai" or "me", text, failed }
  const [waiting, setWaiting] = useState(false); // true while the assistant is working on an answer
  const [text, setText] = useState(""); // what is typed in the box
  const [keyboardSpace, setKeyboardSpace] = useState(0);
  const scroll = useRef(null);
  const tabBarHeight = useTabBarHeight();
  const chatId = useRef(0); // goes up by one every time the chat is cleared, so an answer to a cleared chat gets thrown away

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

  // if the screen goes away while an answer is still on its way, the answer gets thrown away
  useEffect(() => {
    return () => {
      chatId.current += 1;
    };
  }, []);

  // adds the question to the chat, then asks the assistant and adds its answer when it comes back
  const ask = async (question) => {
    if (waiting) return; // one question at a time, so the free limit is not used up by double taps

    const myMessage = { from: "me", text: question };
    const chat = [...messages, myMessage];
    setMessages(chat);
    setWaiting(true);

    // the chat in the shape the backend wants, the error bubbles are left out since they were never real answers
    const history = chat
      .filter((message) => !message.failed)
      .map((message) => ({ role: message.from === "me" ? "user" : "assistant", text: message.text }));

    const thisChat = chatId.current;
    let answer;
    try {
      answer = { from: "ai", text: await askAssistant(history, buildSummary()) };
    } catch (error) {
      // shown as a grey bubble so it is clear it is not a real answer
      answer = { from: "ai", text: error.message, failed: true };
    }

    // only add the answer if the chat was not cleared (or the screen closed) while waiting
    if (thisChat === chatId.current) {
      setMessages((current) => [...current, answer]);
      setWaiting(false);
    }
  };

  // runs when the send button is tapped
  const handleSend = () => {
    const question = text.trim();
    if (!question || waiting) return; // nothing to send, or still waiting on the last answer
    setText("");
    ask(question);
  };

  // wipes the chat back to just the hello message
  const handleClear = () => {
    chatId.current += 1; // so an answer that is still on its way does not show up in the new chat
    setMessages([FIRST_MESSAGE]);
    setWaiting(false);
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
          let textColor = mine ? "#fff" : colors.text;
          if (message.failed) textColor = colors.muted; // errors are grey so they do not look like an answer
          return (
            <View
              key={index}
              style={[
                styles.bubble,
                mine ? styles.myBubble : styles.aiBubble,
                { backgroundColor: mine ? colors.green : colors.card },
              ]}
            >
              <AppText style={styles.bubbleText} color={textColor}>{message.text}</AppText>
            </View>
          );
        })}

        {/* a spinner bubble while the assistant is thinking */}
        {waiting && (
          <View style={[styles.bubble, styles.aiBubble, { backgroundColor: colors.card }]}>
            <ActivityIndicator testID="assistant-thinking" color={colors.green} />
          </View>
        )}

        {/* suggested questions, tapping one asks it */}
        <View style={styles.prompts}>
          {assistantQuestions.map((item) => (
            <TouchableOpacity
              key={item.question}
              style={[styles.prompt, { borderColor: colors.green }]}
              onPress={() => {
                ask(item.question);
              }}
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
        <TouchableOpacity
          style={[styles.send, { backgroundColor: colors.green, opacity: waiting ? 0.5 : 1 }]}
          onPress={handleSend}
          disabled={waiting}
        >
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
