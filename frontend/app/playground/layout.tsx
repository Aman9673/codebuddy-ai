import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code playground",
  description: "Practice Python, JavaScript, C++, Java, and C# with saved drafts, worked examples, and console output.",
};

export default function PlaygroundLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
