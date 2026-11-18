import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python quizzes",
  description: "Practice all 12 Python topics with dedicated quizzes, explained answers, and saved progress.",
};

export default function QuizzesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
