const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = path.resolve(process.cwd(), 'playwright-e2e-output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const logs = [];
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => logs.push(`[console:${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));

  const base = process.env.PW_BASE || 'http://localhost:3010';

  async function visit(route, filename) {
    try {
      const res = await page.goto(base + route, { waitUntil: 'load', timeout: 20000 });
      logs.push(`visited ${route} -> ${res && res.status()}`);
      await page.screenshot({ path: path.join(outDir, filename), fullPage: true }).catch(()=>{});
    } catch (e) {
      logs.push(`visit ${route} failed: ${String(e)}`);
    }
  }

  await visit('/', 'home.png');
  await visit('/signup', 'signup.png');

  // attempt fill
  try {
    await page.fill('input[name="email"]', `e2e+${Date.now()}@example.com`).catch(()=>{});
    await page.fill('input[name="password"]', 'A-Strong-Password1!').catch(()=>{});
    await page.click('button:has-text("Sign")').catch(()=>{});
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, 'signup-after.png') }).catch(()=>{});
    logs.push('signup attempt done');
  } catch (e) {
    logs.push('signup submit failed: ' + String(e));
  }

  await visit('/dashboard', 'dashboard.png');
  await visit('/contacts', 'contacts.png');
  await visit('/analytics', 'analytics.png');
  await visit('/profile', 'profile.png');

  fs.writeFileSync(path.join(outDir, 'e2e-manual-logs.txt'), logs.join('\n'));
  console.log('Done — outputs in', outDir);

  // keep browser open for manual inspection for a short while
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
