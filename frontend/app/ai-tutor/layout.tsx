import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panda AI tutor",
  description: "Ask Panda beginner coding questions and get step-by-step explanations.",
};

export default function TutorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
