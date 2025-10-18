export default function TestLayoutPage() {
  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "20px", textAlign: "center" }}>
      <h1>AI Calling Center - Test Layout</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "30px" }}>
        This is a test page with simplified layout to verify the application structure.
      </p>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "20px",
        marginTop: "40px"
      }}>
        <div className="card" style={{ padding: "20px" }}>
          <h3>Dashboard</h3>
          <p>View analytics and metrics</p>
        </div>
        
        <div className="card" style={{ padding: "20px" }}>
          <h3>CRM</h3>
          <p>Customer relationship management</p>
        </div>
        
        <div className="card" style={{ padding: "20px" }}>
          <h3>Contacts</h3>
          <p>Manage your contact list</p>
        </div>
        
        <div className="card" style={{ padding: "20px" }}>
          <h3>Settings</h3>
          <p>Configure your preferences</p>
        </div>
      </div>
    </div>
  );
}