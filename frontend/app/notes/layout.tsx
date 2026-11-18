import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coding notes",
  description: "Save coding concepts and snippets in a notebook that stays on your device.",
};

export default function NotesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
