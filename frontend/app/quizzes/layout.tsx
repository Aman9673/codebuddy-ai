import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coding quizzes",
  description: "Practice Python, C++, Java, and C# with explained answers and saved progress.",
};

export default function QuizzesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
