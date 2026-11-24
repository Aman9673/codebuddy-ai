import type { AccountProfile } from "../lib/session";

export default function DashboardAccount({ account }: { account: AccountProfile }) {

  return (
    <section className="dashboard-card dashboard-account" aria-labelledby="dashboard-account-title">
      <h2 id="dashboard-account-title">Your account</h2>
      <dl>
        <div><dt>Display name</dt><dd>{account.name}</dd></div>
        <div><dt>Email</dt><dd>{account.email}</dd></div>
      </dl>
    </section>
  );
}
