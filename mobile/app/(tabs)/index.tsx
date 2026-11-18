import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppHeader, AppScreen, Card, Notice } from "@/components/AppUI";
import { useAppData } from "@/contexts/AppContext";
import { lessons } from "@/data/course";
import { colors } from "@/constants/theme";

export default function HomeScreen() {
  const { completedLessons, notes, isReady, storageError } = useAppData();
  const completed = lessons.filter((lesson) =>
    completedLessons.includes(lesson.id),
  );
  const nextLesson = lessons.find(
    (lesson) => !completedLessons.includes(lesson.id),
  );
  const progress = Math.round((completed.length / lessons.length) * 100);
  const earnedXp = completed.reduce((total, lesson) => total + lesson.xp, 0);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="YOUR CODING STUDIO"
        title="Explore. Create. Master."
        caption="Small lessons, real progress, and a coding buddy in your pocket."
      />

      {storageError ? <Notice>{storageError}</Notice> : null}

      <Card style={styles.heroCard}>
        <Text style={styles.panda}>🐼</Text>
        <Text style={styles.heroTitle}>
          {nextLesson ? "Ready for your next mission?" : "Learning path complete!"}
        </Text>
        <Text style={styles.heroCopy}>
          {nextLesson
            ? `${nextLesson.title} · ${nextLesson.duration} · +${nextLesson.xp} XP`
            : "You finished every Python lesson. Keep practicing in the code lab!"}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push(
              nextLesson
                ? { pathname: "/lesson/[id]", params: { id: String(nextLesson.id) } }
                : "/playground",
            )
          }
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>
            {nextLesson ? "Continue learning  →" : "Open code lab  →"}
          </Text>
        </Pressable>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statValue}>{isReady ? completed.length : "—"}</Text>
          <Text style={styles.statLabel}>LESSONS DONE</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statIcon}>✨</Text>
          <Text style={styles.statValue}>{isReady ? earnedXp : "—"}</Text>
          <Text style={styles.statLabel}>XP EARNED</Text>
        </Card>
      </View>

      <Card>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Your learning journey</Text>
          <Text style={styles.progressLabel}>{isReady ? `${progress}%` : "..."}</Text>
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: progress }}
          style={styles.progressTrack}
        >
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.mutedText}>
          {completed.length} of {lessons.length} Python lessons complete
        </Text>
      </Card>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Pick up where you left off</Text>
      </View>
      <View style={styles.missionList}>
        <Mission
          icon="📚"
          title="Python lessons"
          detail={`${lessons.length} bite-sized lessons`}
          onPress={() => router.push("/lessons")}
        />
        <Mission
          icon="💻"
          title="JavaScript playground"
          detail="Write code and see what it does"
          onPress={() => router.push("/playground")}
        />
        <Mission
          icon="🐼"
          title="Ask Panda"
          detail="Get a friendly coding explanation"
          onPress={() => router.push("/tutor")}
        />
        <Mission
          icon="📝"
          title="My notebook"
          detail={`${notes.length} saved ${notes.length === 1 ? "note" : "notes"}`}
          onPress={() => router.push("/notes")}
        />
      </View>
      <Text style={styles.footer}>
        {isReady ? "Your learning data stays on this device." : "Loading your saved progress…"}
      </Text>
    </AppScreen>
  );
}

function Mission({
  icon,
  title,
  detail,
  onPress,
}: {
  icon: string;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.mission, pressed && styles.pressed]}
    >
      <Text style={styles.missionIcon}>{icon}</Text>
      <View style={styles.missionCopy}>
        <Text style={styles.missionTitle}>{title}</Text>
        <Text style={styles.mutedText}>{detail}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    alignItems: "flex-start",
    padding: 21,
    backgroundColor: "#171936",
    borderColor: "#37305e",
  },
  panda: { fontSize: 38 },
  heroTitle: { color: colors.text, fontSize: 19, fontWeight: "900" },
  heroCopy: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  primaryButton: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 47,
    marginTop: 4,
    paddingHorizontal: 15,
    borderRadius: 13,
    backgroundColor: colors.purpleDark,
  },
  primaryButtonText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.78 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 15 },
  statIcon: { fontSize: 22 },
  statValue: { color: colors.text, fontSize: 23, fontWeight: "900" },
  statLabel: { color: colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  progressLabel: { color: colors.cyan, fontWeight: "800" },
  progressTrack: {
    height: 9,
    overflow: "hidden",
    borderRadius: 99,
    backgroundColor: colors.surfaceRaised,
  },
  progressFill: { height: "100%", borderRadius: 99, backgroundColor: colors.purple },
  mutedText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  missionList: { gap: 9 },
  mission: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },
  missionIcon: { fontSize: 22 },
  missionCopy: { flex: 1, gap: 3 },
  missionTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  arrow: { color: colors.purple, fontSize: 23 },
  footer: { color: colors.muted, fontSize: 11, textAlign: "center" },
});
