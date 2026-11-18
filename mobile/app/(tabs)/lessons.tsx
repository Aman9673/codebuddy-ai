import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppHeader, AppScreen, Card, Notice } from "@/components/AppUI";
import { colors } from "@/constants/theme";
import { chapters, lessons } from "@/data/course";
import { useAppData } from "@/contexts/AppContext";

export default function LessonsScreen() {
  const [query, setQuery] = useState("");
  const { completedLessons, storageError } = useAppData();
  const matchingLessons = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return lessons.filter(
      (lesson) =>
        !normalized ||
        `${lesson.title} ${lesson.topic} ${lesson.description}`
          .toLowerCase()
          .includes(normalized),
    );
  }, [query]);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="PYTHON LEARNING PATH"
        title="Learn one step at a time."
        caption={`${lessons.length} beginner lessons. Short examples, clear explanations, and quick checks.`}
      />
      {storageError ? <Notice>{storageError}</Notice> : null}
      <TextInput
        accessibilityLabel="Search lessons"
        placeholder="Search lessons and topics"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        style={styles.search}
      />
      {chapters.map((chapter) => {
        const chapterLessons = matchingLessons.filter(
          (lesson) => lesson.chapterId === chapter.id,
        );
        if (chapterLessons.length === 0) return null;
        const total = lessons.filter(
          (lesson) => lesson.chapterId === chapter.id,
        ).length;
        const done = chapterLessons.filter((lesson) =>
          completedLessons.includes(lesson.id),
        ).length;

        return (
          <Card key={chapter.id} style={styles.chapter}>
            <View style={styles.chapterHeading}>
              <Text style={styles.chapterIcon}>{chapter.icon}</Text>
              <View style={styles.chapterCopy}>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <Text style={styles.chapterDescription}>
                  {chapter.description}
                </Text>
              </View>
              <Text style={styles.chapterProgress}>{done}/{total}</Text>
            </View>
            <View style={styles.lessonList}>
              {chapterLessons.map((lesson) => {
                const complete = completedLessons.includes(lesson.id);
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={lesson.id}
                    onPress={() =>
                      router.push({
                        pathname: "/lesson/[id]",
                        params: { id: String(lesson.id) },
                      })
                    }
                    style={({ pressed }) => [
                      styles.lessonRow,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
                    <View style={styles.lessonCopy}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.lessonMeta}>
                        {lesson.duration} · {lesson.xp} XP · {lesson.topic}
                      </Text>
                    </View>
                    <Text style={complete ? styles.done : styles.open}>
                      {complete ? "✓" : "›"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        );
      })}
      {matchingLessons.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No matching lessons</Text>
          <Text style={styles.lessonMeta}>Try another title or topic.</Text>
        </Card>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: 48,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 14,
  },
  chapter: { gap: 14, padding: 14 },
  chapterHeading: { flexDirection: "row", alignItems: "center", gap: 11 },
  chapterIcon: { fontSize: 25 },
  chapterCopy: { flex: 1, gap: 3 },
  chapterTitle: { color: colors.text, fontSize: 14, fontWeight: "800" },
  chapterDescription: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  chapterProgress: { color: colors.purple, fontSize: 11, fontWeight: "800" },
  lessonList: { gap: 8 },
  lessonRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.background,
  },
  pressed: { opacity: 0.75 },
  lessonEmoji: { fontSize: 22 },
  lessonCopy: { flex: 1, gap: 4 },
  lessonTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  lessonMeta: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  open: { color: colors.purple, fontSize: 22 },
  done: { color: colors.green, fontSize: 18, fontWeight: "900" },
  emptyTitle: { color: colors.text, fontWeight: "800" },
});
