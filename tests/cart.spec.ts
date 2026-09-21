import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Cart', () => {

  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.addFirstProductToCart();
    await home.goToCart();
  });

  test('adding a product shows it in the cart with the right unit price', async ({ page }) => {
    const cart = new CheckoutPage(page);

    await expect(cart.cartRows).toHaveCount(1);
    await expect(cart.quantityInput).toHaveValue('1');
  });

  test('increasing the quantity recalculates the line price and the cart total', async ({ page }) => {
    const cart = new CheckoutPage(page);
    const unitPrice = Number((await cart.linePrice.innerText()).replace(/[^0-9.]/g, ''));

    await cart.updateQuantity(3);

    await expect(cart.linePrice).toHaveText(`$${(unitPrice * 3).toFixed(2)}`);
    await expect(cart.cartTotal).toHaveText(`$${(unitPrice * 3).toFixed(2)}`);
  });

  test('removing the only item empties the cart', async ({ page }) => {
    const cart = new CheckoutPage(page);

    await cart.removeFirstItem();

    await expect(cart.cartRows).toHaveCount(0);
  });

  test('"Continue shopping" returns to the homepage', async ({ page }) => {
    const cart = new CheckoutPage(page);

    await cart.continueShopping();

    await expect(page).toHaveURL(/\/$/);
  });

});
