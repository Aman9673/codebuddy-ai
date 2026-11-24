import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coding lessons",
  description: "Beginner lessons in Python, C++, Java, and C# with worked examples, practice, and quizzes.",
};

export default function LessonsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
