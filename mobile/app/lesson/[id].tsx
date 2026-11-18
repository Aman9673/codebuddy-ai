import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ActionButton, AppHeader, AppScreen, Card, Notice } from "@/components/AppUI";
import { colors } from "@/constants/theme";
import { lessonContent, lessons } from "@/data/course";
import { useAppData } from "@/contexts/AppContext";

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = lessons.find((item) => item.id === Number(id));
  const content = lesson ? lessonContent[lesson.id] : undefined;
  const { completedLessons, completeLesson, storageError } = useAppData();
  const [answer, setAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  if (!lesson || !content) {
    return (
      <AppScreen>
        <AppHeader
          eyebrow="LESSON"
          title="Lesson not found"
          caption="This lesson is not part of the current learning path."
        />
        <ActionButton onPress={() => router.replace("/lessons")}>
          <Text style={styles.actionText}>Back to lessons</Text>
        </ActionButton>
      </AppScreen>
    );
  }

  const alreadyComplete = completedLessons.includes(lesson.id);
  const chooseAnswer = async (index: number) => {
    if (answer === content.answer || saving) return;
    setAnswer(index);
    if (index !== content.answer) {
      setFeedback("Not quite. Read the example again and choose another answer.");
      return;
    }

    setFeedback(content.reason);
    if (!alreadyComplete) {
      setSaving(true);
      try {
        await completeLesson(lesson.id);
      } catch {
        setFeedback(`${content.reason} Your progress could not be saved.`);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <AppScreen>
      <Pressable onPress={() => router.back()} accessibilityRole="button">
        <Text style={styles.back}>‹  All lessons</Text>
      </Pressable>
      <AppHeader
        eyebrow={`CHAPTER ${lesson.chapterId} · ${lesson.topic.toUpperCase()}`}
        title={`${lesson.emoji}  ${lesson.title}`}
        caption={`${lesson.duration} · Complete the quick check to earn ${lesson.xp} XP.`}
      />
      {storageError ? <Notice>{storageError}</Notice> : null}
      <Card>
        <Text style={styles.eyebrow}>LET&apos;S LEARN</Text>
        <Text style={styles.sectionTitle}>{content.heading}</Text>
        <Text style={styles.body}>{content.explanation}</Text>
      </Card>
      <Card>
        <Text style={styles.sectionTitle}>🐍 Python example</Text>
        <Text selectable style={styles.code}>{content.code}</Text>
        <View style={styles.output}>
          <Text style={styles.outputLabel}>EXPECTED OUTPUT</Text>
          <Text selectable style={styles.outputCode}>{content.output}</Text>
        </View>
      </Card>
      <Card>
        <Text style={styles.eyebrow}>QUICK CHECK</Text>
        <Text style={styles.sectionTitle}>{content.question}</Text>
        <View style={styles.options}>
          {content.options.map((option, index) => {
            const chosen = answer === index;
            const correct = answer !== null && index === content.answer;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: chosen }}
                key={option}
                onPress={() => void chooseAnswer(index)}
                disabled={answer === content.answer || saving}
                style={[
                  styles.option,
                  correct && styles.correctOption,
                  chosen && index !== content.answer && styles.wrongOption,
                ]}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
                <Text style={styles.optionText}>{option}</Text>
                {correct ? <Text style={styles.check}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>
        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        {alreadyComplete ? (
          <Text style={styles.completed}>✓ Lesson completed</Text>
        ) : null}
      </Card>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.purple, fontSize: 14, fontWeight: "800", paddingVertical: 6 },
  eyebrow: { color: colors.cyan, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800", lineHeight: 23 },
  body: { color: colors.muted, fontSize: 13, lineHeight: 21 },
  code: {
    padding: 13,
    borderRadius: 11,
    backgroundColor: "#080b18",
    color: "#bfe5ff",
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 19,
  },
  output: { gap: 7 },
  outputLabel: { color: colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  outputCode: { color: colors.green, fontFamily: "monospace", fontSize: 12, lineHeight: 18 },
  options: { gap: 8 },
  option: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  correctOption: { borderColor: colors.green, backgroundColor: "#10271f" },
  wrongOption: { borderColor: colors.danger, backgroundColor: "#2b1824" },
  optionLetter: { color: colors.purple, fontWeight: "900" },
  optionText: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 18 },
  check: { color: colors.green, fontWeight: "900" },
  feedback: { color: colors.green, fontSize: 12, lineHeight: 18 },
  completed: { color: colors.green, fontSize: 12, fontWeight: "800" },
  actionText: { color: "#fff", fontWeight: "800" },
});
