import { useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import { AppHeader, AppScreen, Card } from "@/components/AppUI";
import { colors } from "@/constants/theme";

const examples = [
  { name: "Hello", code: 'console.log("Hello, World!");' },
  {
    name: "Variables",
    code: 'const buddy = "Panda";\nconsole.log("Hi, " + buddy);',
  },
  {
    name: "Math",
    code: "const answer = 6 * 7;\nconsole.log(answer);",
  },
  {
    name: "Loop",
    code: "for (let i = 1; i <= 3; i++) {\n  console.log('Step', i);\n}",
  },
];

const sandboxDocument = `<!doctype html><html><body><script>
window.addEventListener("message", function(event) {
  var request = event.data;
  if (!request || request.type !== "run") return;
  var output = [];
  function format(value) {
    if (typeof value === "string") return value;
    try { return JSON.stringify(value) || String(value); }
    catch { return String(value); }
  }
  console.log = function() {
    output.push(Array.prototype.map.call(arguments, format).join(" "));
  };
  console.info = console.log;
  console.warn = function() {
    output.push("Warning: " + Array.prototype.map.call(arguments, format).join(" "));
  };
  console.error = function() {
    output.push("Error: " + Array.prototype.map.call(arguments, format).join(" "));
  };
  try {
    new Function(request.code)();
  } catch (error) {
    output.push("Error: " + (error && error.message ? error.message : "Code could not run"));
  }
  parent.postMessage({ id: request.id, output: output }, "*");
});
<\/script></body></html>`;

const runnerDocument = `<!doctype html><html><body><script>
var activeFrame = null;
window.runCode = function(id, code) {
  if (activeFrame) activeFrame.remove();
  var frame = document.createElement("iframe");
  var finished = false;
  frame.setAttribute("sandbox", "allow-scripts");
  frame.style.display = "none";
  var finish = function(output) {
    if (finished) return;
    finished = true;
    window.removeEventListener("message", receive);
    if (frame.isConnected) frame.remove();
    activeFrame = null;
    window.ReactNativeWebView.postMessage(JSON.stringify({ id: id, output: output }));
  };
  var receive = function(event) {
    if (event.source !== frame.contentWindow || !event.data || event.data.id !== id) return;
    finish(event.data.output);
  };
  window.addEventListener("message", receive);
  frame.addEventListener("load", function() {
    frame.contentWindow.postMessage({ type: "run", id: id, code: code }, "*");
  });
  frame.srcdoc = ${JSON.stringify(sandboxDocument)};
  activeFrame = frame;
  document.body.appendChild(frame);
  window.setTimeout(function() {
    if (!finished) finish(["Execution timed out. Check for an infinite loop."]);
  }, 2000);
};
<\/script></body></html>`;

export default function PlaygroundScreen() {
  const webView = useRef<WebView>(null);
  const runId = useRef(0);
  const [runnerReady, setRunnerReady] = useState(false);
  const [code, setCode] = useState(examples[0].code);
  const [activeExample, setActiveExample] = useState(examples[0].name);
  const [output, setOutput] = useState<string[]>([
    "Your JavaScript output will appear here.",
  ]);
  const [isRunning, setIsRunning] = useState(false);

  function runCode() {
    if (Platform.OS === "web") {
      setOutput(["Run JavaScript in the installed iOS or Android app."]);
      return;
    }
    if (!runnerReady || !webView.current) {
      setOutput(["The code runner is still starting. Try again in a moment."]);
      return;
    }

    const id = ++runId.current;
    setIsRunning(true);
    setOutput([]);
    webView.current.injectJavaScript(
      `window.runCode(${JSON.stringify(String(id))}, ${JSON.stringify(code)}); true;`,
    );
    setTimeout(() => {
      if (runId.current === id) {
        setIsRunning(false);
        setOutput((current) =>
          current.length
            ? current
            : ["Execution timed out. Check for an infinite loop."],
        );
      }
    }, 2200);
  }

  function receiveOutput(event: WebViewMessageEvent) {
    try {
      const data: unknown = JSON.parse(event.nativeEvent.data);
      if (
        !data ||
        typeof data !== "object" ||
        !("id" in data) ||
        !("output" in data) ||
        data.id !== String(runId.current) ||
        !Array.isArray(data.output) ||
        !data.output.every((line) => typeof line === "string")
      ) {
        return;
      }
      setOutput(
        data.output.length
          ? data.output
          : ["Code ran successfully. No output was printed."],
      );
      setIsRunning(false);
    } catch (error) {
      console.error("Could not read the code runner output:", error);
      setOutput(["Could not read the code runner output."]);
      setIsRunning(false);
    }
  }

  return (
    <AppScreen>
      <AppHeader
        eyebrow="YOUR JAVASCRIPT LAB"
        title="Code it. Run it. Learn it."
        caption="Try an example or edit the code. Your code runs in a restricted web frame on your device."
      />
      <Card style={styles.editorCard}>
        <View style={styles.editorHeader}>
          <Text style={styles.fileName}>🟨  main.js</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setCode("");
              setOutput(["Editor cleared. Write a little JavaScript!"]);
              setActiveExample("");
            }}
          >
            <Text style={styles.clearButton}>Clear</Text>
          </Pressable>
        </View>
        <View style={styles.examples}>
          {examples.map((example) => (
            <Pressable
              key={example.name}
              onPress={() => {
                setActiveExample(example.name);
                setCode(example.code);
                setOutput(["Example loaded. Tap Run to see the result."]);
              }}
              style={[
                styles.exampleChip,
                activeExample === example.name && styles.exampleChipActive,
              ]}
            >
              <Text
                style={[
                  styles.exampleText,
                  activeExample === example.name && styles.exampleTextActive,
                ]}
              >
                {example.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          accessibilityLabel="JavaScript editor"
          value={code}
          onChangeText={(text) => {
            setCode(text);
            setActiveExample("");
          }}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          textAlignVertical="top"
          keyboardAppearance="dark"
          style={styles.codeInput}
        />
        <Pressable
          accessibilityRole="button"
          onPress={runCode}
          disabled={isRunning}
          style={({ pressed }) => [
            styles.runButton,
            (pressed || isRunning) && styles.buttonPressed,
          ]}
        >
          <Text style={styles.runButtonText}>
            {isRunning ? "Running…" : "▶  Run JavaScript"}
          </Text>
        </Pressable>
      </Card>

      <Card>
        <Text style={styles.outputTitle}>OUTPUT</Text>
        {output.map((line, index) => (
          <Text key={`${index}-${line}`} selectable style={styles.outputLine}>
            {line}
          </Text>
        ))}
      </Card>

      {Platform.OS !== "web" ? (
        <WebView
          ref={webView}
          source={{ html: runnerDocument }}
          originWhitelist={["*"]}
          javaScriptEnabled
          allowFileAccess={false}
          mixedContentMode="never"
          onLoadEnd={() => setRunnerReady(true)}
          onMessage={receiveOutput}
          onError={() => {
            setRunnerReady(false);
            setOutput(["The isolated code runner could not start."]);
            setIsRunning(false);
          }}
          style={styles.runner}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  editorCard: { padding: 14, gap: 12 },
  editorHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fileName: { color: colors.text, fontSize: 12, fontWeight: "700" },
  clearButton: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  examples: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  exampleChip: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: colors.surfaceRaised,
  },
  exampleChipActive: { backgroundColor: "#352759" },
  exampleText: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  exampleTextActive: { color: "#e5dcff" },
  codeInput: {
    minHeight: 190,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: "#080b18",
    color: "#bfe5ff",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 19,
  },
  runButton: {
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: colors.purpleDark,
  },
  runButtonText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  buttonPressed: { opacity: 0.74 },
  outputTitle: { color: colors.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  outputLine: { color: colors.green, fontFamily: "monospace", fontSize: 12, lineHeight: 19 },
  runner: { position: "absolute", left: -2, top: -2, width: 1, height: 1 },
});
