import type { Metadata, Viewport } from "next";
import { DM_Sans, Nunito } from "next/font/google";
import "./globals.css";
import "./launch.css";
import "./auth.css";
import SiteChrome from "./components/SiteChrome";
import ServiceWorker from "./components/ServiceWorker";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#5f3fc1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CodeBuddy AI — Learn to code with Panda",
    template: "%s · CodeBuddy AI",
  },
  description:
    "Learn Python, C++, Java, and C#, ask Panda for help, and keep coding notes. Install CodeBuddy on your phone.",
  applicationName: "CodeBuddy AI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CodeBuddy",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "CodeBuddy AI",
    description:
      "A beginner coding studio you can use in the browser or install on your phone.",
    type: "website",
    siteName: "CodeBuddy AI",
    images: ["/space-panda.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorker />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
