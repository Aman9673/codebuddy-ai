export type Note = {
  id: number;
  title: string;
  content: string;
  language: string;
};

export type StorageMode = "device" | "database";

const STORAGE_KEY = "codebuddy.notes.v1";

let activeMode: StorageMode = "device";
let activeBase: string | null = null;
let detected = false;

function apiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return "http://127.0.0.1:8000";
  }
  return null;
}

function readLocal(): Note[] {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isNote);
  } catch {
    return [];
  }
}

function writeLocal(notes: Note[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// Synchronous writes protect browser-only notes even when a tab closes immediately.
export function saveDeviceDraft(note: Note): void {
  const notes = readLocal();
  writeLocal(notes.map((item) => item.id === note.id ? note : item));
}

function isNote(value: unknown): value is Note {
  if (!value || typeof value !== "object") return false;
  const note = value as Note;
  return (
    Number.isInteger(note.id) &&
    typeof note.title === "string" &&
    typeof note.content === "string" &&
    typeof note.language === "string"
  );
}

async function detect(): Promise<void> {
  if (detected) return;
  detected = true;
  const base = apiBase();
  if (!base) return;

  try {
    const health = await fetch(`${base}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(1200),
    });
    if (!health.ok) return;
    const response = await fetch(`${base}/api/notes`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return;
    activeMode = "database";
    activeBase = base;
  } catch {
    activeMode = "device";
    activeBase = null;
  }
}

export async function loadNotebook(): Promise<{
  notes: Note[];
  mode: StorageMode;
}> {
  await detect();
  if (activeMode === "database" && activeBase) {
    const response = await fetch(`${activeBase}/api/notes`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load notes (HTTP ${response.status}).`);
    }
    const notes: unknown = await response.json();
    return {
      notes: Array.isArray(notes) ? notes.filter(isNote) : [],
      mode: "database",
    };
  }
  return { notes: readLocal(), mode: "device" };
}

export async function createNoteRecord(note: Omit<Note, "id">): Promise<Note> {
  await detect();
  if (activeMode === "database" && activeBase) {
    const response = await fetch(`${activeBase}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    if (!response.ok) {
      throw new Error("Could not create the note.");
    }
    return response.json();
  }

  const notes = readLocal();
  const created: Note = {
    ...note,
    id: notes.reduce((max, item) => Math.max(max, item.id), 0) + 1,
  };
  writeLocal([created, ...notes]);
  return created;
}

export async function updateNoteRecord(note: Note): Promise<void> {
  await detect();
  if (activeMode === "database" && activeBase) {
    const response = await fetch(`${activeBase}/api/notes/${note.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: note.title,
        content: note.content,
        language: note.language,
      }),
    });
    if (!response.ok) {
      throw new Error(`Save failed (HTTP ${response.status}).`);
    }
    return;
  }

  const notes = readLocal();
  writeLocal(notes.map((item) => (item.id === note.id ? note : item)));
}

export async function deleteNoteRecord(id: number): Promise<void> {
  await detect();
  if (activeMode === "database" && activeBase) {
    const response = await fetch(`${activeBase}/api/notes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Delete failed (HTTP ${response.status}).`);
    }
    return;
  }
  writeLocal(readLocal().filter((note) => note.id !== id));
}
