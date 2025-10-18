"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "20px", textAlign: "center" }}>
      <h1>Welcome to AI Calling Center</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "30px" }}>
        Your intelligent calling and CRM platform
      </p>
      
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "40px" }}>
        <Link href="/dashboard" className="btn">
          Go to Dashboard
        </Link>
        <Link href="/crm" className="btn-outline">
          Access CRM
        </Link>
      </div>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "20px",
        marginTop: "40px"
      }}>
        <div className="card" style={{ padding: "20px" }}>
          <h3>📞 Smart Calling</h3>
          <p>AI-powered calling automation</p>
        </div>
        
        <div className="card" style={{ padding: "20px" }}>
          <h3>📊 Analytics</h3>
          <p>Real-time performance metrics</p>
        </div>
        
        <div className="card" style={{ padding: "20px" }}>
          <h3>👥 CRM Integration</h3>
          <p>Fully integrated customer management</p>
        </div>
        
        <div className="card" style={{ padding: "20px" }}>
          <h3>⚙️ Settings</h3>
          <p>Customize your experience</p>
        </div>
      </div>
      
      <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
        <h3>Getting Started</h3>
        <p>Navigate using the menu above to explore different sections of the application.</p>
        <p>The CRM integration is now accessible through the CRM link in the navigation bar.</p>
      </div>
    </div>
  );
}