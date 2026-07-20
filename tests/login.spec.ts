import { test, expect } from '@playwright/test';
import { users } from '../Fixture/Users';

test.describe('Login', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('User can login successfully with valid credentials', async ({ page }) => {
    await page.getByRole('textbox', { name: /email address/i }).fill(users.customer.email);
    await page.getByRole('textbox', { name: /password/i }).fill(users.customer.password);

    await Promise.all([
      page.waitForURL(/account/),
      page.getByRole('button', { name: /login/i }).click(),
    ]);

    await expect(page).toHaveURL(/account/);
  });
});
