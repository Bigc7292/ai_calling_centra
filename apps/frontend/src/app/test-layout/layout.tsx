"use client";
import "./../../styles/globals.css";
import Link from "next/link";

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ maxWidth: 1120, margin: "24px auto", padding: "0 16px" }}>{children}</main>
      </body>
    </html>
  );
}

function Header() {
  return (
    <header style={{ position: "sticky", top: 0, background: "#fff", borderBottom: "1px solid #e6ebf2" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1120, margin: "0 auto", padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <strong>AI Calling Center</strong>
        </div>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link className="btn-outline" href="/">Home</Link>
          <Link className="btn-outline" href="/dashboard">Dashboard</Link>
          <Link className="btn-outline" href="/crm">CRM</Link>
          <Link className="btn-outline" href="/contacts">Contacts</Link>
          <Link className="btn-outline" href="/settings">Settings</Link>
        </nav>
      </div>
    </header>
  );
}