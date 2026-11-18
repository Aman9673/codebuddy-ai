
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { downloadText } from "../lib/download";
import {
  createNoteRecord,
  deleteNoteRecord,
  loadNotebook,
  saveDeviceDraft,
  updateNoteRecord,
  type Note,
  type StorageMode,
} from "../lib/notebook";

const categories = [
  "General",
  "Python",
  "JavaScript",
  "HTML & CSS",
  "SQL",
  "Interview Prep",
];

const emptyNote = {
  title: "Untitled note",
  content: "",
  language: "General",
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("Loading notes...");
  const [storageMode, setStorageMode] = useState<StorageMode>("device");

  const saveTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const pendingNotes = useRef(new Map<number, Note>());
  const requestVersion = useRef(0);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  const selectedNote =
    notes.find((note) => note.id === selectedId) ?? null;

  const loadNotes = useCallback(async () => {
    try {
      const result = await loadNotebook();

      setError("");
      setNotes(result.notes);
      setStorageMode(result.mode);
      setSelectedId((current) => {
        if (current !== null && result.notes.some((note) => note.id === current)) {
          return current;
        }

        return result.notes[0]?.id ?? null;
      });

      setSaveMessage(
        result.mode === "database"
          ? "✓ Connected to your notes database"
          : "✓ Notes are saved on this device",
      );
    } catch (err) {
      console.error("Loading notes failed:", err);

      setError("Could not open your notebook. Please try again.");
      setSaveMessage("Could not load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timers = saveTimers.current;
    const pending = pendingNotes.current;
    const warnUnsaved = (event: BeforeUnloadEvent) => {
      if (pending.size) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("beforeunload", warnUnsaved);
    const loadTimer = window.setTimeout(() => {
      void loadNotes();
    }, 0);

    return () => {
      window.clearTimeout(loadTimer);
      window.removeEventListener("beforeunload", warnUnsaved);
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      for (const note of pending.values()) {
        writeQueue.current = writeQueue.current.catch(() => {}).then(() => updateNoteRecord(note));
        void writeQueue.current.catch((error) => console.error("Could not finish saving a note:", error));
      }
    };
  }, [loadNotes]);

  const filteredNotes = notes.filter((note) => {
    const query = search.toLowerCase();

    const matchesSearch =
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query);

    const matchesCategory =
      filter === "All" || note.language === filter;

    return matchesSearch && matchesCategory;
  });

  async function createNote() {
    if (loading || saving) return;

    setError("");
    setSaving(true);
    setSaveMessage("Creating note...");

    try {
      const newNote = await createNoteRecord(emptyNote);

      setNotes((previous) => [newNote, ...previous]);
      setSelectedId(newNote.id);
      setSearch("");
      setFilter("All");
      setSaveMessage("✓ Note created successfully");

    } catch (err) {
      console.error("Creating note failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not create note. Check your backend."
      );

      setSaveMessage("Creation failed");
    } finally {
      setSaving(false);
    }
  }

  function updateNote(
    field: "title" | "content" | "language",
    value: string
  ) {
    if (!selectedNote) return;

    const noteId = selectedNote.id;
    const version = ++requestVersion.current;

    const updatedNote: Note = {
      ...selectedNote,
      [field]: value,
    };

    setNotes((previous) =>
      previous.map((note) =>
        note.id === noteId ? updatedNote : note
      )
    );

    setError("");
    setSaveMessage("Unsaved changes...");

    if (storageMode === "device") {
      try { saveDeviceDraft(updatedNote); setSaveMessage("Saved on this device"); }
      catch { setError("This browser could not save your changes. Download the note to keep a copy."); setSaveMessage("Save failed"); }
      return;
    }

    const previousTimer = saveTimers.current.get(noteId);
    if (previousTimer) clearTimeout(previousTimer);
    pendingNotes.current.set(noteId, updatedNote);

    saveTimers.current.set(noteId, setTimeout(async () => {
      setSaving(true);
      setSaveMessage("Saving...");

      try {
        writeQueue.current = writeQueue.current.catch(() => {}).then(() => updateNoteRecord(updatedNote));
        await writeQueue.current;
        if (pendingNotes.current.get(noteId) === updatedNote) pendingNotes.current.delete(noteId);

        if (requestVersion.current === version) {
          setSaveMessage("✓ All changes saved");
          setError("");
        }
      } catch (err) {
        console.error("Saving note failed:", err);

        if (requestVersion.current === version) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not save note."
          );

          setSaveMessage("Save failed");
        }
      } finally {
        if (requestVersion.current === version) {
          setSaving(false);
        }
      }
    }, 600));
  }

  async function deleteNote() {
    if (!selectedNote) return;

    const confirmed = window.confirm(
      `Delete "${selectedNote.title || "Untitled note"}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const noteToDelete = selectedNote;
    const timer = saveTimers.current.get(noteToDelete.id);
    if (timer) clearTimeout(timer);
    saveTimers.current.delete(noteToDelete.id);
    pendingNotes.current.delete(noteToDelete.id);

    setError("");
    setSaving(true);
    setSaveMessage("Deleting...");

    try {
      await writeQueue.current.catch(() => {});
      await deleteNoteRecord(noteToDelete.id);

      const remaining = notes.filter(
        (note) => note.id !== noteToDelete.id
      );

      setNotes(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      setSaveMessage("✓ Note deleted");
    } catch (err) {
      console.error("Deleting note failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not delete note."
      );

      setSaveMessage("Delete failed");
    } finally {
      setSaving(false);
    }
  }

  async function retrySave() {
    if (saving) return;
    if (!pendingNotes.current.size && !selectedNote) { void loadNotes(); return; }
    setSaving(true);
    setError("");
    try {
      if (storageMode === "device" && selectedNote) saveDeviceDraft(selectedNote);
      else {
        for (const note of pendingNotes.current.values()) {
          writeQueue.current = writeQueue.current.catch(() => {}).then(() => updateNoteRecord(note));
          await writeQueue.current;
          if (pendingNotes.current.get(note.id) === note) pendingNotes.current.delete(note.id);
        }
      }
      setSaveMessage("All changes saved");
    } catch { setError("Could not save your changes. Please retry or download your note."); }
    finally { setSaving(false); }
  }

  function formatDate() {
    return new Date().toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="notes-page">
      <header className="notes-header">
        <Link className="notes-brand" href="/">
          🐼 <span>CodeBuddy</span>
        </Link>

        <Link className="notes-back" href="/">
          ← Dashboard
        </Link>
      </header>

      <section className="notes-content">
        <div className="notes-intro">
          <span className="notes-eyebrow">
            YOUR PERSONAL KNOWLEDGE SPACE
          </span>

          <h1>
            My coding <span>notebook.</span> 📝
          </h1>

          <p>
            Save useful concepts, keep code snippets, and collect
            everything you learn in one place.
          </p>
        </div>

        <div className="notes-toolbar">
          <div className="notes-search">
            <span>⌕</span>

            <input
              aria-label="Search notes"
              placeholder="Search your notes..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="compact-actions"><button disabled={loading || notes.length === 0} onClick={() => { downloadText("codebuddy-notebook.json", JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), notes }, null, 2), "application/json"); setSaveMessage("Notebook exported"); }}>Export notebook</button></div>
          <button
            type="button"
            className="new-note-button"
            disabled={loading || saving}
            onClick={() => void createNote()}
          >
            + New note
          </button>
        </div>

        {error && (
          <div className="notes-error" role="alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => void retrySave()}
              disabled={loading || saving}
            >
              Retry
            </button>
          </div>
        )}

        <div className="notes-workspace">
          <aside className="notes-list-panel">
            <div className="notes-list-heading">
              <strong>All notes</strong>
              <span>{filteredNotes.length}</span>
            </div>

            <div className="notes-filters">
              <label htmlFor="notes-category">CATEGORY</label>

              <select
                id="notes-category"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option>All</option>

                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="notes-list">
              {loading ? (
                <p className="notes-empty">Loading notes...</p>
              ) : filteredNotes.length === 0 ? (
                <div className="notes-empty">
                  <span>📒</span>
                  <strong>No notes found</strong>
                  <p>Create a note or change your search.</p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <button
                    type="button"
                    key={note.id}
                    className={`note-list-item ${
                      selectedId === note.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedId(note.id)}
                  >
                    <span className="note-list-icon">
                      {note.language === "Python"
                        ? "🐍"
                        : note.language === "JavaScript"
                        ? "🟨"
                        : note.language === "SQL"
                        ? "🗄️"
                        : "📝"}
                    </span>

                    <span className="note-list-text">
                      <strong>
                        {note.title || "Untitled note"}
                      </strong>

                      <small>
                        {note.content.trim().slice(0, 55) ||
                          "No content yet"}
                      </small>

                      <small>
                        {storageMode === "database"
                          ? "Saved in your database"
                          : "Saved on this device"}
                      </small>
                    </span>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="note-editor-panel">
            {selectedNote ? (
              <>
                <div className="note-editor-toolbar">
                  <div className="compact-actions"><button onClick={() => downloadText(`${selectedNote.title || "Untitled note"}.md`, `# ${selectedNote.title}

${selectedNote.content}`)}>Download .md</button></div>
                  <span className="note-save-status" role="status">
                    {saving ? "⏳ " : ""}
                    {saveMessage}
                  </span>

                  <button
                    type="button"
                    className="delete-note-button"
                    onClick={() => void deleteNote()}
                    disabled={saving}
                  >
                    🗑 Delete
                  </button>
                </div>

                <input
                  className="note-title-input"
                  aria-label="Note title"
                  value={selectedNote.title}
                  maxLength={200}
                  onChange={(event) =>
                    updateNote("title", event.target.value)
                  }
                  placeholder="Give your note a title..."
                />

                <div className="note-category-control">
                  <label htmlFor="note-language">CATEGORY</label>

                  <select
                    id="note-language"
                    value={selectedNote.language}
                    onChange={(event) =>
                      updateNote("language", event.target.value)
                    }
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  className="note-content-input"
                  aria-label="Note content"
                  value={selectedNote.content}
                  maxLength={50000}
                  onChange={(event) =>
                    updateNote("content", event.target.value)
                  }
                  placeholder={
                    "Start writing your notes here...\n\nExample:\n• Variables store values.\n• print() displays output.\n• Use examples to remember concepts."
                  }
                />

                <div className="note-editor-footer">
                  <span>
                    {selectedNote.content.length} characters
                  </span>

                  <span>Today {formatDate()}</span>
                </div>
              </>
            ) : (
              <div className="note-no-selection">
                <span>📝</span>
                <h2>Your notebook is ready</h2>

                <p>
                  Create a note to save your coding knowledge.
                </p>

                <button
                  type="button"
                  className="new-note-button"
                  onClick={() => void createNote()}
                >
                  + Create your first note
                </button>
              </div>
            )}
          </section>
        </div>

        <p className="notes-privacy">
          {storageMode === "database"
            ? "🗄️ Notes are stored in your local database through the CodeBuddy backend."
            : "📱 Notes stay in this browser on your phone or computer. They are not uploaded."}
        </p>
      </section>
    </main>
  );
}
