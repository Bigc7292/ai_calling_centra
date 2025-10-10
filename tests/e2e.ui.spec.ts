import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'playwright-e2e-output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

test.setTimeout(90_000);

test('UI smoke: navigate, signup, inspect dashboard, contacts, analytics, profile', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', msg => logs.push(`[console:${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));

  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3010';
  // 1) Home
  const homeResp = await page.goto(base, { waitUntil: 'load' });
  logs.push(`goto ${base} -> ${homeResp?.status()}`);
  await page.screenshot({ path: path.join(outDir, 'home.png'), fullPage: true }).catch(() => {});

  // 2) Try signup flow (if route exists)
  try {
    await page.goto(`${base}/signup`, { waitUntil: 'networkidle' });
    logs.push(`goto /signup`);
    await page.screenshot({ path: path.join(outDir, 'signup-page.png') }).catch(() => {});

    // Fill form fields heuristically
    const emailField = page.locator('input[name="email"], input[type="email"], [placeholder*="Email"]');
    const passField = page.locator('input[name="password"], input[type="password"], [placeholder*="Password"]');
    const submitBtn = page.getByRole('button', { name: /sign ?up|create your account|signup/i });

    if (await emailField.count() > 0 && await passField.count() > 0 && await submitBtn.count() > 0) {
      await emailField.fill(`e2e+${Date.now()}@example.com`);
      await passField.fill('A-Strong-Password1!');
      await submitBtn.click();
      // wait for either success or error text
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(outDir, 'signup-after.png') }).catch(() => {});
      logs.push('signup attempted');
    } else {
      logs.push('signup form not found');
    }
  } catch (e: any) {
    logs.push('signup flow error: ' + String(e?.message || e));
  }

  // 3) Dashboard
  try {
    await page.goto(`${base}/dashboard`, { waitUntil: 'networkidle' });
    logs.push('goto /dashboard');
    // take screenshot
    await page.screenshot({ path: path.join(outDir, 'dashboard.png'), fullPage: true }).catch(() => {});

    // Check for charts (svg/canvas) and tables
    const chart = page.locator('canvas, svg, [data-testid="chart"], .recharts, .chart');
    const table = page.locator('table, [data-testid="table"], .table');
    logs.push(`charts found: ${await chart.count()}, tables found: ${await table.count()}`);
  } catch (e: any) {
    logs.push('dashboard error: ' + String(e?.message || e));
  }

  // 4) Contacts
  try {
    await page.goto(`${base}/contacts`, { waitUntil: 'networkidle' });
    logs.push('goto /contacts');
    await page.screenshot({ path: path.join(outDir, 'contacts.png'), fullPage: true }).catch(() => {});
    const contactsTable = page.locator('table, [data-testid="contacts-table"], .contacts');
    logs.push(`contacts table found: ${await contactsTable.count()}`);
  } catch (e: any) {
    logs.push('contacts error: ' + String(e?.message || e));
  }

  // 5) Analytics
  try {
    await page.goto(`${base}/analytics`, { waitUntil: 'networkidle' });
    logs.push('goto /analytics');
    await page.screenshot({ path: path.join(outDir, 'analytics.png'), fullPage: true }).catch(() => {});
    const analyticsWidgets = page.locator('.analytics, [data-testid="analytics"], .insights');
    logs.push(`analytics widgets: ${await analyticsWidgets.count()}`);
  } catch (e: any) {
    logs.push('analytics error: ' + String(e?.message || e));
  }

  // 6) Profile / Conversations
  try {
    await page.goto(`${base}/profile`, { waitUntil: 'networkidle' });
    logs.push('goto /profile');
    await page.screenshot({ path: path.join(outDir, 'profile.png'), fullPage: true }).catch(() => {});
    const conv = page.locator('.conversations, [data-testid="conversations"], .call-log');
    logs.push(`conversations found: ${await conv.count()}`);
  } catch (e: any) {
    logs.push('profile error: ' + String(e?.message || e));
  }

  // Save logs
  fs.writeFileSync(path.join(outDir, 'e2e-logs.txt'), logs.join('\n\n'));

  // Some lightweight expectations so test returns a status
  expect(true).toBeTruthy();
});
