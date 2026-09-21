import { Page } from '@playwright/test';

export type BillingAddress = {
  country: string; // ISO 3166-1 alpha-2 code, e.g. 'UY'
  postalCode: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
};

export type PaymentMethod =
  | 'bank-transfer'
  | 'cash-on-delivery'
  | 'credit-card'
  | 'buy-now-pay-later'
  | 'gift-card';

/**
 * The cart and the checkout wizard (login/guest -> billing address -> payment)
 * all live under the same /checkout route, so a single page object covers
 * every step.
 */
export class CheckoutPage {
  constructor(private readonly page: Page) {}

  // --- Step 1: cart ---

  get cartRows() {
    return this.page.locator('tbody tr');
  }

  get quantityInput() {
    return this.page.getByTestId('product-quantity').first();
  }

  get linePrice() {
    return this.page.getByTestId('line-price').first();
  }

  get cartTotal() {
    return this.page.getByTestId('cart-total');
  }

  async updateQuantity(value: number) {
    await this.quantityInput.fill(String(value));
    await this.quantityInput.blur();
  }

  async removeFirstItem() {
    await this.cartRows.first().locator('a.btn-danger').click();
  }

  async continueShopping() {
    await this.page.getByTestId('continue-shopping').click();
  }

  async proceedToLogin() {
    await this.page.getByTestId('proceed-1').click();
  }

  // --- Step 2: login or guest ---

  async continueAsGuest(email: string, firstName: string, lastName: string) {
    await this.page.getByRole('tab', { name: /continuar como invitado|continue as guest/i }).click();
    await this.page.getByTestId('guest-email').fill(email);
    await this.page.getByTestId('guest-first-name').fill(firstName);
    await this.page.getByTestId('guest-last-name').fill(lastName);
    await this.page.getByTestId('guest-submit').click();
  }

  async proceedToAddress() {
    await this.page.getByTestId('proceed-2-guest').click();
  }

  // --- Step 3: billing address ---

  async fillBillingAddress(address: BillingAddress) {
    await this.page.getByTestId('country').selectOption(address.country);
    await this.page.getByTestId('postal_code').fill(address.postalCode);
    await this.page.getByTestId('house_number').fill(address.houseNumber);
    await this.page.getByTestId('street').fill(address.street);
    await this.page.getByTestId('city').fill(address.city);
    await this.page.getByTestId('state').fill(address.state);
  }

  async proceedToPayment() {
    await this.page.getByTestId('proceed-3').click();
  }

  // --- Step 4: payment ---

  async selectPaymentMethod(method: PaymentMethod) {
    await this.page.getByTestId('payment-method').selectOption(method);
  }

  async finishOrder() {
    await this.page.getByTestId('finish').click();
  }

  get paymentSuccessMessage() {
    return this.page.getByTestId('payment-success-message');
  }
}
