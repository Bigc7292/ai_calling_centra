"use client";
import "./../styles/globals.css";
import Link from "next/link";
import { AuthGate, useAuth } from "../components/AuthGate";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthGate>
          <Header />
          <main style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>{children}</main>
        </AuthGate>
      </body>
    </html>
  );
}

function Header() {
  const { signOut, session } = useAuth();
  return (
    <header style={{ position: "sticky", top: 0, background: "#fff", borderBottom: "1px solid #e6ebf2" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1120, margin: "0 auto", padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <img src="/logos/primary.png" width={28} height={28} alt="logo" />
          <strong>eva_eva</strong>
        </div>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link className="btn-outline" href="/">Dashboard</Link>
          <Link className="btn-outline" href="/contacts">Contacts</Link>
          <Link className="btn-outline" href="/settings">Settings</Link>
          {session && <button className="btn-outline" onClick={signOut}>Sign out</button>}
        </nav>
      </div>
    </header>
  );
}