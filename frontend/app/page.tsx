import { cookies } from "next/headers";
import { Suspense } from "react";
import Dashboard from "./Dashboard";
import Navigation from "./components/Navigation";
import SiteFooter from "./components/SiteFooter";
import { getSessionProfile, sessionCookie } from "./lib/session";

async function DashboardContent() {
  const cookieStore = await cookies();
  const account = await getSessionProfile(cookieStore.get(sessionCookie)?.value);

  return (
    <>
      <Navigation initialProfile={account} />
      <Dashboard account={account} />
      <SiteFooter />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<main className="cosmic-dashboard"><p role="status">Loading CodeBuddy…</p></main>}>
      <DashboardContent />
    </Suspense>
  );
}
