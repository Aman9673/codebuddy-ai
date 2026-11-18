import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python lessons",
  description: "In-depth beginner Python lessons with detailed explanations, worked examples, guided practice, and separate topic quizzes.",
};

export default function LessonsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
