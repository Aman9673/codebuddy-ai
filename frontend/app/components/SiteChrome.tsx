"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import SiteFooter from "./SiteFooter";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showChrome = !["/", "/login", "/signup"].includes(pathname);

  return (
    <>
      {showChrome && <Navigation />}
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div id="main-content" tabIndex={-1}>{children}</div>
      {showChrome && <SiteFooter />}
    </>
  );
}
