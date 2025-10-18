import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const crmRouter = Router();

/**
 * CRM Integration Routes
 * These routes proxy requests to the Frappe CRM backend
 * NOTE: Authentication has been removed for testing purposes
 */

// Middleware to bypass authentication for CRM routes
crmRouter.use((req: Request, res: Response, next) => {
  // Override any authentication requirements for CRM routes
  next();
});

// Proxy CRM dashboard requests
crmRouter.get('/dashboard', (req, res) => {
  // This would proxy to the CRM dashboard
  res.json({
    message: 'CRM Dashboard Integration',
    status: 'active',
    endpoints: {
      leads: '/api/crm/leads',
      contacts: '/api/crm/contacts',
      deals: '/api/crm/deals'
    }
  });
});

// Proxy CRM leads requests
crmRouter.get('/leads', async (req, res) => {
  try {
    // In a real implementation, this would fetch leads from the CRM
    // Example of how you might proxy to the actual CRM:
    /*
    const crmResponse = await fetch('http://localhost:8000/api/leads', {
      headers: {
        'Authorization': `Bearer ${req.headers.authorization}`
      }
    });
    const data = await crmResponse.json();
    res.json(data);
    */
    
    // For now, return mock data
    res.json({
      message: 'CRM Leads Integration',
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'New' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Contacted' }
      ],
      count: 2
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads from CRM' });
  }
});

// Proxy CRM contacts requests
crmRouter.get('/contacts', async (req, res) => {
  try {
    // In a real implementation, this would fetch contacts from the CRM
    // Example of how you might proxy to the actual CRM:
    /*
    const crmResponse = await fetch('http://localhost:8000/api/contacts', {
      headers: {
        'Authorization': `Bearer ${req.headers.authorization}`
      }
    });
    const data = await crmResponse.json();
    res.json(data);
    */
    
    // For now, return mock data
    res.json({
      message: 'CRM Contacts Integration',
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321' }
      ],
      count: 2
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts from CRM' });
  }
});

// Proxy CRM deals requests
crmRouter.get('/deals', async (req, res) => {
  try {
    // In a real implementation, this would fetch deals from the CRM
    // Example of how you might proxy to the actual CRM:
    /*
    const crmResponse = await fetch('http://localhost:8000/api/deals', {
      headers: {
        'Authorization': `Bearer ${req.headers.authorization}`
      }
    });
    const data = await crmResponse.json();
    res.json(data);
    */
    
    // For now, return mock data
    res.json({
      message: 'CRM Deals Integration',
      data: [
        { id: 1, title: 'Website Redesign', value: 5000, status: 'Proposal' },
        { id: 2, title: 'Mobile App Development', value: 15000, status: 'Negotiation' }
      ],
      count: 2
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals from CRM' });
  }
});

export default crmRouter;