/**
 * Full CRM Integration Test Script
 * 
 * This script tests the CRM integration endpoints with mock data
 */

async function testCrmIntegration() {
  console.log('🚀 Testing CRM Integration');
  
  try {
    // Test CRM dashboard endpoint
    console.log('\n📊 Testing CRM Dashboard Endpoint...');
    const dashboardResponse = await fetch('http://localhost:3001/crm/dashboard');
    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard endpoint response:', dashboardData.message);
    console.log('🔄 CRM status:', dashboardData.status);
    
    // Test CRM leads endpoint
    console.log('\n📋 Testing CRM Leads Endpoint...');
    const leadsResponse = await fetch('http://localhost:3001/crm/leads');
    const leadsData = await leadsResponse.json();
    console.log('✅ Leads endpoint response:', leadsData.message);
    console.log('📊 Leads count:', leadsData.count);
    if (leadsData.data && leadsData.data.length > 0) {
      console.log('📝 Sample lead:', leadsData.data[0].name);
    }
    
    // Test CRM contacts endpoint
    console.log('\n👥 Testing CRM Contacts Endpoint...');
    const contactsResponse = await fetch('http://localhost:3001/crm/contacts');
    const contactsData = await contactsResponse.json();
    console.log('✅ Contacts endpoint response:', contactsData.message);
    console.log('📊 Contacts count:', contactsData.count);
    if (contactsData.data && contactsData.data.length > 0) {
      console.log('📝 Sample contact:', contactsData.data[0].name);
    }
    
    // Test CRM deals endpoint
    console.log('\n💼 Testing CRM Deals Endpoint...');
    const dealsResponse = await fetch('http://localhost:3001/crm/deals');
    const dealsData = await dealsResponse.json();
    console.log('✅ Deals endpoint response:', dealsData.message);
    console.log('📊 Deals count:', dealsData.count);
    if (dealsData.data && dealsData.data.length > 0) {
      console.log('📝 Sample deal:', dealsData.data[0].title);
    }
    
    console.log('\n🎉 CRM Integration Test Completed Successfully!');
    console.log('📝 Summary:');
    console.log('   - Dashboard: ✅ Active');
    console.log('   - Leads: ✅', leadsData.count, 'items');
    console.log('   - Contacts: ✅', contactsData.count, 'items');
    console.log('   - Deals: ✅', dealsData.count, 'items');
    
  } catch (error) {
    console.error('❌ CRM Integration Test Failed:', error.message);
  }
}

// Run the test
testCrmIntegration();