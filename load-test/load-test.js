// PRD v1.3, Sec 1 & 7: Load Testing Stub (K6)
import http from 'k6/http';
import { check, sleep } from 'k6';

// --- Test Configuration ---
export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp up to 100 users over 1 minute
    { duration: '2m', target: 500 },   // Ramp up to 500 users over 2 minutes
    { duration: '5m', target: 1000 },  // Ramp up to 1000 users and hold for 5 minutes
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // < 1% failed requests
    http_req_duration: ['p(95)<500'], // 95th percentile response time < 500ms
    'http_req_duration{endpoint:outbound_call}': ['p(95)<1500'], // P95 for critical call endpoint < 1.5s
  },
};

const BASE_URL = 'https://your-api-endpoint.com'; // <-- REPLACE with your deployed API URL

// --- Test Setup ---
// This function runs once before the test starts.
export function setup() {
  // 1. Login as a test user to get an auth token
  // In a real test, you'd fetch credentials from a config or environment variables
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'load.test.user@example.com',
    password: 'supersecret',
  }));

  check(loginRes, { 'login successful': (r) => r.status === 200 });
  const authToken = loginRes.json('token');
  return { authToken };
}

// --- Virtual User (VU) Code ---
// This function is executed repeatedly by each VU.
export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.authToken}`,
    'Content-Type': 'application/json',
  };

  // 1. Simulate making an outbound call (high-load endpoint)
  const outboundRes = http.post(
    `${BASE_URL}/api/calls/outbound`,
    JSON.stringify({ to: '+15551234567', campaignId: 'some-campaign-id' }),
    { headers, tags: { endpoint: 'outbound_call' } }
  );
  check(outboundRes, { 'outbound call successful': (r) => r.status === 201 });

  sleep(1); // Think time between actions

  // 2. Simulate querying analytics (cached endpoint)
  const analyticsRes = http.get(
    `${BASE_URL}/api/analytics/kpis`,
    { headers, tags: { endpoint: 'analytics_kpis' } }
  );
  check(analyticsRes, { 'analytics query successful': (r) => r.status === 200 });

  sleep(3);
}
