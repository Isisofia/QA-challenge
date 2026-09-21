import { Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/');
  }

  /** Opens the first in-stock product listed on the homepage. */
  async openFirstProduct() {
    await this.page.getByTestId('product-name').first().click();
  }

  /** Adds the first in-stock product to the cart and returns its name and unit price. */
  async addFirstProductToCart(): Promise<{ name: string; unitPrice: string }> {
    await this.openFirstProduct();
    const name = await this.page.getByTestId('product-name').innerText();
    const unitPrice = await this.page.getByTestId('unit-price').innerText();
    await this.page.getByTestId('add-to-cart').click();
    return { name, unitPrice };
  }

  async goToCart() {
    await this.page.getByTestId('nav-cart').click();
  }
}
