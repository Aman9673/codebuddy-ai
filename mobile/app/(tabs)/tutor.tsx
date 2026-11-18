import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppUI";
import { colors } from "@/constants/theme";

type Message = {
  id: number;
  role: "user" | "panda";
  text: string;
};

const suggestions = [
  "Explain Python variables",
  "How do loops work?",
  "Help me debug an error",
];

function localAnswer(question: string) {
  const text = question.toLowerCase();
  if (text.includes("variable")) {
    return 'A variable is a named place to keep a value. In Python, write `name = "Panda"` to store text, then use `print(name)` to show it.';
  }
  if (text.includes("loop") || text.includes("repeat")) {
    return "A loop repeats a small set of instructions. A `for` loop is great when you know what you are going through, like `for number in range(3): print(number)`. It prints 0, 1, and 2.";
  }
  if (text.includes("function")) {
    return 'A function is a reusable block of code. In Python, start it with `def`, like `def say_hi(): print("Hi!")`, then call it with `say_hi()`.';
  }
  if (text.includes("error") || text.includes("debug")) {
    return "Read the last line of the error first; it usually names the problem. Check spelling, brackets, and indentation, then run one small part at a time. Share the error and a few code lines if you want to debug it together.";
  }
  if (text.includes("list") || text.includes("array")) {
    return 'A Python list keeps several values in order: `pets = ["Panda", "Cat"]`. The first item is `pets[0]`, because list positions start at zero.';
  }
  return "Let’s work through it one step at a time. Tell me what you are trying to build, paste a small example, or ask about a Python or JavaScript idea.";
}

async function askPanda(question: string) {
  const apiBase = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiBase) return localAnswer(question);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${apiBase}/api/tutor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Panda API returned HTTP ${response.status}.`);
    }
    const data: unknown = await response.json();
    if (
      data &&
      typeof data === "object" &&
      "reply" in data &&
      typeof data.reply === "string" &&
      data.reply.trim()
    ) {
      return data.reply;
    }
    throw new Error("Panda API returned an invalid answer.");
  } catch (error) {
    console.error("Could not reach Panda's configured API:", error);
    return `${localAnswer(question)}\n\nPanda's online tutor is unavailable, so these on-device tips are shown instead.`;
  } finally {
    clearTimeout(timeout);
  }
}

export default function TutorScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const nextId = useRef(1);
  const scrollView = useRef<ScrollView>(null);

  useEffect(() => {
    scrollView.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  async function sendMessage(suggested?: string) {
    const question = (suggested ?? input).trim();
    if (!question || loading) return;

    const userMessage: Message = {
      id: nextId.current++,
      role: "user",
      text: question,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const answer = await askPanda(question);
      setMessages((current) => [
        ...current,
        { id: nextId.current++, role: "panda", text: answer },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.content}>
          <AppHeader
            eyebrow="YOUR CODING COMPANION"
            title="Ask Panda 🐼"
            caption="Get a friendly explanation, one small step at a time."
          />
          <View style={styles.status}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              {process.env.EXPO_PUBLIC_API_URL
                ? "Online tutor + on-device tips"
                : "On-device beginner tips"}
            </Text>
          </View>
          <ScrollView
            ref={scrollView}
            style={styles.messages}
            contentContainerStyle={styles.messageList}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollView.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View style={styles.welcome}>
                <Text style={styles.welcomeEmoji}>🐼</Text>
                <Text style={styles.welcomeTitle}>Hey, coder!</Text>
                <Text style={styles.welcomeText}>
                  Pick a question or type what you are learning.
                </Text>
                <View style={styles.suggestions}>
                  {suggestions.map((suggestion) => (
                    <Pressable
                      accessibilityRole="button"
                      key={suggestion}
                      onPress={() => void sendMessage(suggestion)}
                      style={styles.suggestion}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.role === "user" ? styles.userBubble : styles.pandaBubble,
                  ]}
                >
                  <Text style={styles.messageAuthor}>
                    {message.role === "user" ? "YOU" : "PANDA"}
                  </Text>
                  <Text selectable style={styles.messageText}>
                    {message.text}
                  </Text>
                </View>
              ))
            )}
            {loading ? (
              <Text style={styles.typing}>Panda is thinking…</Text>
            ) : null}
          </ScrollView>
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Ask Panda a coding question"
              placeholder="Ask a coding question…"
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={2000}
              autoCorrect
              returnKeyType="send"
              onSubmitEditing={() => void sendMessage()}
              blurOnSubmit
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send question"
              onPress={() => void sendMessage()}
              disabled={!input.trim() || loading}
              style={[
                styles.sendButton,
                (!input.trim() || loading) && styles.sendDisabled,
              ]}
            >
              <Text style={styles.sendText}>↑</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  status: { flexDirection: "row", alignItems: "center", gap: 7 },
  statusDot: { width: 7, height: 7, borderRadius: 9, backgroundColor: colors.green },
  statusText: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  messages: { flex: 1 },
  messageList: { gap: 11, paddingBottom: 10, flexGrow: 1 },
  welcome: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 28,
  },
  welcomeEmoji: { fontSize: 42 },
  welcomeTitle: { color: colors.text, fontSize: 18, fontWeight: "900" },
  welcomeText: { color: colors.muted, fontSize: 12, textAlign: "center" },
  suggestions: { alignSelf: "stretch", gap: 8, marginTop: 5 },
  suggestion: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  suggestionText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  messageBubble: { maxWidth: "90%", gap: 6, padding: 13, borderRadius: 15 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#362662" },
  pandaBubble: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  messageAuthor: { color: colors.cyan, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  messageText: { color: colors.text, fontSize: 13, lineHeight: 20 },
  typing: { color: colors.muted, fontSize: 12, paddingVertical: 8 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 9,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 46,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 13,
  },
  sendButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.purpleDark,
  },
  sendDisabled: { opacity: 0.45 },
  sendText: { color: "#fff", fontSize: 23, fontWeight: "800" },
});
