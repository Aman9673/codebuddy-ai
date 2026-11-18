import Link from "next/link";

export default function SiteFooter() {
  return <footer className="site-footer"><div><Link href="/" className="footer-brand">🐼 CodeBuddy</Link><p>A curious mind. A little practice. Endless possibilities.</p></div><div className="footer-links"><Link href="/lessons">Learn Python</Link><Link href="/playground">Build something</Link><Link href="/about">About & privacy</Link></div><small>Made for learning · No account required</small></footer>;
}
