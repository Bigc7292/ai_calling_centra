import baseConfig from '../playwright.config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3010',
  },
  // remove webServer so Playwright does not wait for it
  webServer: undefined,
});
