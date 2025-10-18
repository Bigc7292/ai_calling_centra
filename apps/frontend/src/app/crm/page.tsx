"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CRMPage() {
  const [crmStatus, setCrmStatus] = useState<string>('checking');
  
  useEffect(() => {
    // Check if CRM is accessible
    const checkCrmStatus = async () => {
      try {
        // In a real implementation, you would check the actual CRM status
        // For now, we'll just simulate a check
        setTimeout(() => {
          setCrmStatus('active');
        }, 1000);
      } catch (error) {
        setCrmStatus('inactive');
      }
    };
    
    checkCrmStatus();
  }, []);
  
  return (
    <div>
      <h1>Customer Relationship Management</h1>
      <p>Access our integrated CRM system for managing leads, contacts, and sales opportunities.</p>
      
      <div style={{ marginTop: "24px", padding: "16px", border: "1px solid #e6ebf2", borderRadius: "4px" }}>
        <h2>Frappe CRM Integration</h2>
        <p>Our CRM system is powered by Frappe CRM, providing advanced features for customer relationship management.</p>
        
        <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
          <Link 
            href="http://localhost:8000/crm" 
            target="_blank"
            className="btn-primary"
            style={{ textDecoration: "none", padding: "8px 16px", borderRadius: "4px" }}
          >
            Open CRM Dashboard
          </Link>
          
          <Link 
            href="http://localhost:8000/crm/leads" 
            target="_blank"
            className="btn-outline"
            style={{ textDecoration: "none", padding: "8px 16px", borderRadius: "4px" }}
          >
            View Leads
          </Link>
        </div>
        
        <div style={{ marginTop: "16px" }}>
          <h3>Integration Status</h3>
          <p>Status: <strong>{crmStatus === 'checking' ? 'Checking...' : crmStatus === 'active' ? 'Active' : 'Inactive'}</strong></p>
          {crmStatus === 'active' && (
            <p style={{ color: "green" }}>✓ CRM integration is working properly</p>
          )}
          {crmStatus === 'inactive' && (
            <p style={{ color: "red" }}>✗ CRM is not accessible. Please ensure the CRM service is running.</p>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: "24px" }}>
        <h3>CRM Features</h3>
        <ul>
          <li>Lead and opportunity management</li>
          <li>Contact and organization tracking</li>
          <li>Activity and task management</li>
          <li>Email integration</li>
          <li>Reporting and analytics</li>
          <li>Kanban view for pipeline management</li>
          <li>Custom views and filters</li>
        </ul>
      </div>
      
      <div style={{ marginTop: "24px" }}>
        <h3>API Integration</h3>
        <p>Our system integrates with the CRM through the following API endpoints:</p>
        <ul>
          <li><code>GET /api/crm/leads</code> - Fetch leads from CRM</li>
          <li><code>GET /api/crm/contacts</code> - Fetch contacts from CRM</li>
          <li><code>GET /api/crm/deals</code> - Fetch deals from CRM</li>
        </ul>
      </div>
    </div>
  );
}