import { test, expect, Page } from '@playwright/test';

type RegisterUser = {
  firstName: string;
  lastName: string;
  dob: string;
  postalCode: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  password: string;
};

// 'country' isn't part of RegisterUser: it's a fixed selection, not free-text data.
type SkippableField = keyof RegisterUser | 'country';

function buildValidUser(overrides: Partial<RegisterUser> = {}): RegisterUser {
  return {
    firstName: 'Test',
    lastName: 'User',
    dob: '1990-01-01',
    postalCode: '1234',
    houseNumber: '42',
    street: 'Fake Street',
    city: 'Test City',
    state: 'Test State',
    phone: '3053053005',
    email: `test_${Date.now()}_${Math.random().toString(36).slice(2)}@mail.com`,
    password: 'P$w0Rd*26',
    ...overrides,
  };
}

test.describe('Register', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register');
  });

  async function fillRegisterForm(page: Page, user: RegisterUser, options: { skip?: SkippableField } = {}) {
    const { skip } = options;

    if (skip !== 'firstName') await page.getByRole('textbox', { name: /first name/i }).fill(user.firstName);
    if (skip !== 'lastName') await page.getByRole('textbox', { name: /last name/i }).fill(user.lastName);
    if (skip !== 'dob') await page.getByRole('textbox', { name: /date of birth/i }).fill(user.dob);

    if (skip !== 'country') await page.getByRole('combobox', { name: /country/i }).selectOption('UY');

    if (skip !== 'postalCode') await page.getByRole('textbox', { name: /postal code/i }).fill(user.postalCode);
    if (skip !== 'houseNumber') await page.getByRole('textbox', { name: /house number/i }).fill(user.houseNumber);

    if (skip !== 'street') await page.getByRole('textbox', { name: /street/i }).fill(user.street);
    if (skip !== 'city') await page.getByRole('textbox', { name: /city/i }).fill(user.city);
    if (skip !== 'state') await page.getByRole('textbox', { name: /state/i }).fill(user.state);

    if (skip !== 'phone') await page.getByRole('textbox', { name: /phone/i }).fill(user.phone);
    if (skip !== 'email') await page.getByRole('textbox', { name: /email address/i }).fill(user.email);
    if (skip !== 'password') await page.getByRole('textbox', { name: /password/i }).fill(user.password);
  }

  async function submitRegisterForm(page: Page) {
    await page.getByRole('button', { name: /register/i }).click();
  }

  test('User can register successfully with valid data', async ({ page }) => {
    const user = buildValidUser();

    await fillRegisterForm(page, user);

    await Promise.all([
      page.waitForURL(/auth\/login/),
      submitRegisterForm(page),
    ]);

    await expect(page).toHaveURL(/auth\/login/);
  });

  test.describe('Required fields', () => {
    // The app gives no per-field error message on this form (unlike login), only a
    // CSS-only invalid state, so the only observable signal is that registration
    // does not go through: the wizard never reaches /auth/login.
    const requiredFields: SkippableField[] = [
      'firstName', 'lastName', 'dob', 'country', 'postalCode',
      'houseNumber', 'street', 'city', 'state', 'phone', 'email', 'password',
    ];

    for (const field of requiredFields) {
      test(`does not register when ${field} is missing`, async ({ page }) => {
        const user = buildValidUser();

        await fillRegisterForm(page, user, { skip: field });
        await submitRegisterForm(page);

        await expect(page).not.toHaveURL(/auth\/login/, { timeout: 3000 });
        await expect(page).toHaveURL(/auth\/register/);
      });
    }
  });

  test.describe('Invalid formats', () => {
    const invalidValues: Partial<Record<keyof RegisterUser, string>> = {
      email: 'not-an-email',
      phone: 'abcdefg',
    };

    for (const [field, value] of Object.entries(invalidValues) as [keyof RegisterUser, string][]) {
      test(`rejects an invalid ${field}`, async ({ page }) => {
        const user = buildValidUser({ [field]: value } as Partial<RegisterUser>);

        await fillRegisterForm(page, user);
        await submitRegisterForm(page);

        await expect(page).not.toHaveURL(/auth\/login/, { timeout: 3000 });
        await expect(page).toHaveURL(/auth\/register/);
      });
    }
  });

  test('shows an error when the email is already registered', async ({ page }) => {
    const user = buildValidUser({ email: 'customer@practicesoftwaretesting.com' });

    await fillRegisterForm(page, user);
    await submitRegisterForm(page);

    await expect(page.getByTestId('register-error')).toHaveText(
      'A customer with this email address already exists.'
    );
  });

  test('shows an error when the password does not meet the complexity requirements', async ({ page }) => {
    const user = buildValidUser({ password: 'abc' });

    await fillRegisterForm(page, user);
    await submitRegisterForm(page);

    await expect(page.getByTestId('password-error')).toHaveText(
      /Password must be minimal 6 characters long\.\s+Password can not include invalid characters\./
    );
  });

});
