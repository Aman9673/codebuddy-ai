import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppHeader, AppScreen, Card, Notice } from "@/components/AppUI";
import { colors } from "@/constants/theme";
import { useAppData, type Note } from "@/contexts/AppContext";

export default function NotesScreen() {
  const { notes, isReady, storageError, saveNote, deleteNote } = useAppData();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredNotes = useMemo(() => {
    const search = query.trim().toLowerCase();
    return notes.filter(
      (note) =>
        !search ||
        `${note.title} ${note.content}`.toLowerCase().includes(search),
    );
  }, [notes, query]);

  function startNewNote() {
    setEditingId(null);
    setIsCreating(true);
    setTitle("");
    setContent("");
    setMessage("");
  }

  function editNote(note: Note) {
    setEditingId(note.id);
    setIsCreating(false);
    setTitle(note.title);
    setContent(note.content);
    setMessage("");
  }

  function closeEditor() {
    setEditingId(null);
    setIsCreating(false);
    setTitle("");
    setContent("");
  }

  async function saveCurrentNote() {
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      await saveNote({
        id: editingId ?? undefined,
        title,
        content,
      });
      setMessage("Saved on this device.");
      closeEditor();
    } catch {
      setMessage("Could not save this note. Check your device storage and try again.");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(note: Note) {
    Alert.alert("Delete note?", `Delete "${note.title}" from this device?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void deleteNote(note.id).catch(() =>
            setMessage("Could not delete the note. Please try again."),
          );
          if (editingId === note.id) closeEditor();
        },
      },
    ]);
  }

  const editingNote = notes.find((note) => note.id === editingId);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="YOUR PERSONAL KNOWLEDGE SPACE"
        title="My coding notebook."
        caption="Save useful ideas and code snippets. Your notes stay on this device."
      />
      {storageError ? <Notice>{storageError}</Notice> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}

      {isCreating || editingNote ? (
        <Card style={styles.editor}>
          <Text style={styles.editorTitle}>
            {isCreating ? "New note" : "Edit note"}
          </Text>
          <TextInput
            accessibilityLabel="Note title"
            placeholder="Note title"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
            style={styles.titleInput}
          />
          <TextInput
            accessibilityLabel="Note content"
            placeholder="Write a coding idea or snippet…"
            placeholderTextColor={colors.muted}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={50000}
            textAlignVertical="top"
            autoCapitalize="sentences"
            style={styles.contentInput}
          />
          <View style={styles.editorActions}>
            <Pressable
              accessibilityRole="button"
              onPress={closeEditor}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => void saveCurrentNote()}
              disabled={saving}
              style={[styles.saveButton, saving && styles.disabled]}
            >
              <Text style={styles.saveText}>{saving ? "Saving…" : "Save note"}</Text>
            </Pressable>
          </View>
          {editingNote ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => confirmDelete(editingNote)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete this note</Text>
            </Pressable>
          ) : null}
        </Card>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={startNewNote}
          style={({ pressed }) => [styles.newNoteButton, pressed && styles.disabled]}
        >
          <Text style={styles.newNoteText}>＋  Create a note</Text>
        </Pressable>
      )}

      <TextInput
        accessibilityLabel="Search notes"
        placeholder="Search your notes"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        style={styles.search}
      />

      {!isReady ? (
        <Text style={styles.emptyText}>Loading notes…</Text>
      ) : filteredNotes.length ? (
        <View style={styles.noteList}>
          {filteredNotes.map((note) => (
            <Pressable
              accessibilityRole="button"
              key={note.id}
              onPress={() => editNote(note)}
              style={({ pressed }) => [styles.noteRow, pressed && styles.disabled]}
            >
              <View style={styles.noteIcon}>
                <Text>📝</Text>
              </View>
              <View style={styles.noteInfo}>
                <Text numberOfLines={1} style={styles.noteTitle}>
                  {note.title || "Untitled note"}
                </Text>
                <Text numberOfLines={2} style={styles.notePreview}>
                  {note.content || "No content yet"}
                </Text>
                <Text style={styles.noteDate}>
                  {new Date(note.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.noteArrow}>›</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📒</Text>
          <Text style={styles.editorTitle}>
            {notes.length ? "No matching notes" : "Your notebook is ready"}
          </Text>
          <Text style={styles.emptyText}>
            {notes.length
              ? "Try another search."
              : "Create a note to keep the coding ideas you want to remember."}
          </Text>
        </Card>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  newNoteButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.purpleDark,
  },
  newNoteText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  search: {
    minHeight: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 13,
  },
  editor: { gap: 11 },
  editorTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  titleInput: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  contentInput: {
    minHeight: 150,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  editorActions: { flexDirection: "row", justifyContent: "flex-end", gap: 9 },
  cancelButton: { justifyContent: "center", paddingHorizontal: 12 },
  cancelText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  saveButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: colors.purpleDark,
  },
  saveText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  disabled: { opacity: 0.6 },
  deleteButton: { alignSelf: "flex-start", paddingVertical: 5 },
  deleteText: { color: colors.danger, fontSize: 12, fontWeight: "700" },
  message: { color: colors.green, fontSize: 12 },
  noteList: { gap: 9 },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  noteIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
  },
  noteInfo: { flex: 1, gap: 4 },
  noteTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  notePreview: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  noteDate: { color: colors.muted, fontSize: 9 },
  noteArrow: { color: colors.purple, fontSize: 23 },
  emptyCard: { alignItems: "center", paddingVertical: 24 },
  emptyEmoji: { fontSize: 35 },
  emptyText: { color: colors.muted, fontSize: 12, lineHeight: 19, textAlign: "center" },
});
