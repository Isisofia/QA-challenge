import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout', () => {

  test('a guest can complete an order paying cash on delivery', async ({ page }) => {
    const home = new HomePage(page);
    const checkout = new CheckoutPage(page);

    await home.goto();
    await home.addFirstProductToCart();
    await home.goToCart();

    await checkout.proceedToLogin();
    await checkout.continueAsGuest('guest.checkout.test@example.com', 'Guest', 'Tester');
    await checkout.proceedToAddress();

    await checkout.fillBillingAddress({
      country: 'UY',
      postalCode: '11800',
      houseNumber: '123',
      street: 'Main street',
      city: 'Montevideo',
      state: 'Montevideo',
    });
    await checkout.proceedToPayment();

    await checkout.selectPaymentMethod('cash-on-delivery');
    await checkout.finishOrder();

    await expect(checkout.paymentSuccessMessage).toBeVisible();
  });

});
