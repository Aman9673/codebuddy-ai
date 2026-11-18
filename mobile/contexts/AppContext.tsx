import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Note = {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
};

type AppContextValue = {
  completedLessons: number[];
  notes: Note[];
  isReady: boolean;
  storageError: string;
  completeLesson: (id: number) => Promise<void>;
  saveNote: (note: Pick<Note, "title" | "content"> & { id?: number }) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
};

const PROGRESS_KEY = "codebuddy.mobile.completedLessons.v1";
const NOTES_KEY = "codebuddy.mobile.notes.v1";
const AppContext = createContext<AppContextValue | null>(null);

function parseCompletedLessons(value: string | null): number[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (
    !Array.isArray(parsed) ||
    !parsed.every((id) => Number.isInteger(id) && id > 0)
  ) {
    return [];
  }
  return [...new Set(parsed as number[])];
}

function parseNotes(value: string | null): Note[] {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (item): item is Note =>
      item !== null &&
      typeof item === "object" &&
      Number.isInteger(item.id) &&
      typeof item.title === "string" &&
      typeof item.content === "string" &&
      typeof item.updatedAt === "string",
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const values = await AsyncStorage.multiGet([PROGRESS_KEY, NOTES_KEY]);
        const progressValue = values.find(([key]) => key === PROGRESS_KEY)?.[1];
        const notesValue = values.find(([key]) => key === NOTES_KEY)?.[1];
        if (active) {
          setCompletedLessons(parseCompletedLessons(progressValue ?? null));
          setNotes(parseNotes(notesValue ?? null));
        }
      } catch (error) {
        console.error("Could not load CodeBuddy data from this device:", error);
        if (active) {
          setStorageError("Saved data could not be loaded. Restart the app and try again.");
        }
      } finally {
        if (active) setIsReady(true);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (key: string, value: unknown) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      setStorageError("");
    } catch (error) {
      console.error("Could not save CodeBuddy data to this device:", error);
      setStorageError("Your latest change could not be saved on this device.");
      throw error;
    }
  }, []);

  const completeLesson = useCallback(
    async (id: number) => {
      const next = [...new Set([...completedLessons, id])];
      setCompletedLessons(next);
      await persist(PROGRESS_KEY, next);
    },
    [completedLessons, persist],
  );

  const saveNote = useCallback(
    async (note: Pick<Note, "title" | "content"> & { id?: number }) => {
      const now = new Date().toISOString();
      const id =
        note.id ??
        Math.max(Date.now(), ...notes.map((existing) => existing.id + 1));
      const nextNote: Note = {
        id,
        title: note.title.trim() || "Untitled note",
        content: note.content,
        updatedAt: now,
      };
      const next = [
        nextNote,
        ...notes.filter((existing) => existing.id !== id),
      ];
      setNotes(next);
      await persist(NOTES_KEY, next);
    },
    [notes, persist],
  );

  const deleteNote = useCallback(
    async (id: number) => {
      const next = notes.filter((note) => note.id !== id);
      setNotes(next);
      await persist(NOTES_KEY, next);
    },
    [notes, persist],
  );

  const value = useMemo(
    () => ({
      completedLessons,
      notes,
      isReady,
      storageError,
      completeLesson,
      saveNote,
      deleteNote,
    }),
    [
      completedLessons,
      notes,
      isReady,
      storageError,
      completeLesson,
      saveNote,
      deleteNote,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider.");
  }
  return context;
}
