import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python & JavaScript playground",
  description: "Run Python and JavaScript in your browser with saved drafts, lesson examples, and console output.",
};

export default function PlaygroundLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
