import { test, expect } from '@playwright/test';

test('should display dashboard after login', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://localhost:3010');
  
  // Check that we're on the login page
  await expect(page).toHaveTitle(/Sign In/);
  
  // Fill in login form
  await page.fill('input[name="email"]', 'drivendatadynamics@gmail.com');
  await page.fill('input[name="password"]', 'TempPassword123!');
  
  // Submit the form
  await page.click('button:has-text("Sign In")');
  
  // Wait for navigation to dashboard
  await page.waitForURL('http://localhost:3010/dashboard');
  
  // Check that we're on the dashboard
  await expect(page).toHaveURL('http://localhost:3010/dashboard');
  await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  
  // Check that dashboard elements are present
  await expect(page.locator('text=Total Calls')).toBeVisible();
  await expect(page.locator('text=Total Meetings')).toBeVisible();
  await expect(page.locator('text=Answer Rate')).toBeVisible();
  await expect(page.locator('text=Total Cost')).toBeVisible();
});