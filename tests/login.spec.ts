import { test, expect } from '@playwright/test';
import { users } from '../Fixture/Users';

test.describe('Register', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register');
  });

  async function fillRegisterForm(page, user) {
    await page.getByRole('textbox', { name: /first name/i }).fill(user.firstName);
    await page.getByRole('textbox', { name: /last name/i }).fill(user.lastName);
    await page.getByRole('textbox', { name: /date of birth/i }).fill(user.dob);

    await page.getByRole('combobox', { name: /country/i }).selectOption('UY');

    await page.getByRole('textbox', { name: /postal code/i }).fill(user.postalCode);
    await page.getByRole('textbox', { name: /house number/i }).fill(user.houseNumber);

    await page.getByRole('textbox', { name: /street/i }).fill(user.street);
    await page.getByRole('textbox', { name: /city/i }).fill(user.city);
    await page.getByRole('textbox', { name: /state/i }).fill(user.state);

    await page.getByRole('textbox', { name: /phone/i }).fill(user.phone);
    await page.getByRole('textbox', { name: /email address/i }).fill(user.email);
    await page.getByRole('textbox', { name: /password/i }).fill(user.password);
  }

  test('User can register successfully with valid data', async ({ page }) => {

    const user = {
      firstName: 'Test',
      lastName: 'User',
      dob: '1990-01-01',
      postalCode: '1234',
      houseNumber: '42',
      street: 'Fake Street',
      city: 'Test City',
      state: 'Test State',
      phone: '3053053005',
      email: `test_${Date.now()}@mail.com`,
      password: 'P$w0Rd*26',
    };

    await fillRegisterForm(page, user);

    await Promise.all([
      page.waitForURL(/auth\/login/),
      page.getByRole('button', { name: /register/i }).click(),
    ]);

    await expect(page).toHaveURL(/auth\/login/);
  });

});

test.describe('Login', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('User can login successfully with valid credentials', async ({ page }) => {
    await page.getByRole('textbox', { name: /email address/i }).fill(users.customer.email);
    await page.getByRole('textbox', { name: /password/i }).fill(users.customer.password);
    await page.getByRole('button', { name: /login/i }).click();
  });
});