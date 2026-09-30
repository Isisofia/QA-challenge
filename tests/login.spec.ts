import { test, expect } from '@playwright/test';
import { users } from '../Fixture/Users';

test.describe('Login', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('User can login successfully with valid credentials', async ({ page }) => {
    await page.getByTestId('email').fill(users.customer.email);
    await page.getByTestId('password').fill(users.customer.password);

    await Promise.all([
      page.waitForURL(/account/),
      page.getByTestId('login-submit').click(),
    ]);

    await expect(page).toHaveURL(/account/);
  });

  test.describe('Invalid credentials', () => {
    test('shows an error with a valid email and the wrong password', async ({ page }) => {
      await page.getByTestId('email').fill(users.customer.email);
      await page.getByTestId('password').fill('wrong-password-123');
      await page.getByTestId('login-submit').click();

      await expect(page.getByTestId('login-error')).toHaveText('Invalid email or password');
      await expect(page).toHaveURL(/\/auth\/login$/);
    });

    test('shows the same generic error for an email that is not registered', async ({ page }) => {
      await page.getByTestId('email').fill('no-such-user-1234@example.com');
      await page.getByTestId('password').fill('whatever-password');
      await page.getByTestId('login-submit').click();

      // Same message as a wrong password: the app must not reveal whether the email exists.
      await expect(page.getByTestId('login-error')).toHaveText('Invalid email or password');
    });

    test('does not authenticate with a SQL-injection style payload', async ({ page }) => {
      await page.getByTestId('email').fill("' OR '1'='1");
      await page.getByTestId('password').fill("' OR '1'='1");
      await page.getByTestId('login-submit').click();

      await expect(page.getByTestId('email-error')).toHaveText('Email format is invalid');
      await expect(page).toHaveURL(/\/auth\/login$/);
    });
  });

  test.describe('Field validation', () => {
    test('requires an email address', async ({ page }) => {
      await page.getByTestId('password').fill(users.customer.password);
      await page.getByTestId('login-submit').click();

      await expect(page.getByTestId('email-error')).toHaveText('Email is required');
    });

    test('requires a password', async ({ page }) => {
      await page.getByTestId('email').fill(users.customer.email);
      await page.getByTestId('login-submit').click();

      await expect(page.getByTestId('password-error')).toHaveText('Password is required');
    });

    test('requires both fields when the form is submitted empty', async ({ page }) => {
      await page.getByTestId('login-submit').click();

      await expect(page.getByTestId('email-error')).toHaveText('Email is required');
      await expect(page.getByTestId('password-error')).toHaveText('Password is required');
    });

    test('rejects an invalid email format', async ({ page }) => {
      await page.getByTestId('email').fill('not-an-email');
      await page.getByTestId('password').fill(users.customer.password);
      await page.getByTestId('login-submit').click();

      await expect(page.getByTestId('email-error')).toHaveText('Email format is invalid');
    });
  });
});
