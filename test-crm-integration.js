/**
 * CRM Integration Test Script
 * 
 * This script tests the CRM integration endpoints
 */

async function testCrmIntegration() {
  console.log('🚀 Testing CRM Integration');
  
  try {
    // Test CRM leads endpoint
    console.log('\n📋 Testing CRM Leads Endpoint...');
    const leadsResponse = await fetch('http://localhost:3001/crm/leads');
    const leadsData = await leadsResponse.json();
    console.log('✅ Leads endpoint response:', leadsData.message);
    console.log('📊 Leads count:', leadsData.count);
    
    // Test CRM contacts endpoint
    console.log('\n👥 Testing CRM Contacts Endpoint...');
    const contactsResponse = await fetch('http://localhost:3001/crm/contacts');
    const contactsData = await contactsResponse.json();
    console.log('✅ Contacts endpoint response:', contactsData.message);
    console.log('📊 Contacts count:', contactsData.count);
    
    // Test CRM deals endpoint
    console.log('\n💼 Testing CRM Deals Endpoint...');
    const dealsResponse = await fetch('http://localhost:3001/crm/deals');
    const dealsData = await dealsResponse.json();
    console.log('✅ Deals endpoint response:', dealsData.message);
    console.log('📊 Deals count:', dealsData.count);
    
    console.log('\n🎉 CRM Integration Test Completed Successfully!');
    console.log('📝 Note: For full integration testing, proper authentication is required.');
    
  } catch (error) {
    console.error('❌ CRM Integration Test Failed:', error.message);
  }
}

// Run the test
testCrmIntegration();