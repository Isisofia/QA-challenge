import { test, expect, Page, Locator } from '@playwright/test';

// The price range is an ngx-slider: dragging gets the handle close to the
// target value, then arrow keys nudge it to the exact value (ngx-slider
// doesn't expose a native <input type=range>, so a plain fill()/click() won't work).
async function dragSliderHandleTo(page: Page, handle: Locator, targetValue: number) {
  const track = page.locator('ngx-slider');
  const [handleBox, trackBox] = await Promise.all([handle.boundingBox(), track.boundingBox()]);
  if (!handleBox || !trackBox) throw new Error('Could not measure the price slider');

  const sliderMin = 0;
  const sliderMax = 200;
  const targetX = trackBox.x + ((targetValue - sliderMin) / (sliderMax - sliderMin)) * trackBox.width;
  const y = handleBox.y + handleBox.height / 2;

  await page.mouse.move(handleBox.x + handleBox.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(targetX, y, { steps: 20 });
  await page.mouse.up();

  await handle.focus();
  for (let i = 0; i < 20; i++) {
    const current = Number(await handle.getAttribute('aria-valuenow'));
    if (current === targetValue) break;
    await page.keyboard.press(current > targetValue ? 'ArrowLeft' : 'ArrowRight');
  }
}

test.describe('Catalog filters', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('filtering by the Hammer category shows only hammer products', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Hammer', exact: true }).check();

    const productNames = page.getByTestId('product-name');
    const nonHammerProducts = productNames.filter({ hasNotText: /hammer/i });

    await expect(productNames.first()).toBeVisible();
    await expect(nonHammerProducts).toHaveCount(0);
  });

  test('filtering by Hammer hides products from other Hand Tools subcategories', async ({ page }) => {
    const pliers = page.getByTestId('product-name').filter({ hasText: 'Pliers' });
    await expect(pliers.first()).toBeVisible();

    await page.getByRole('checkbox', { name: 'Hammer', exact: true }).check();

    await expect(page.getByTestId('product-name').first()).toBeVisible();
    await expect(pliers).toHaveCount(0);
  });

  test('unchecking the Hammer filter brings back products from other categories', async ({ page }) => {
    const hammerCheckbox = page.getByRole('checkbox', { name: 'Hammer', exact: true });
    const pliers = page.getByTestId('product-name').filter({ hasText: 'Pliers' });

    await hammerCheckbox.check();
    await expect(pliers).toHaveCount(0);

    await hammerCheckbox.uncheck();
    await expect(pliers.first()).toBeVisible();
  });

  test('combining the Hammer and Measures category filters shows products from both categories', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Hammer', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Measures', exact: true }).check();

    const productNames = page.getByTestId('product-name');
    const hammerProducts = productNames.filter({ hasText: /hammer/i });
    const measuresProducts = productNames.filter({ hasText: /measur/i });
    const otherProducts = productNames.filter({ hasNotText: /hammer|measur/i });

    await expect(hammerProducts.first()).toBeVisible();
    await expect(measuresProducts.first()).toBeVisible();
    await expect(otherProducts).toHaveCount(0);
  });

  test('filtering by a 1 to 50 price range only shows products in that range', async ({ page }) => {
    await dragSliderHandleTo(page, page.locator('.ngx-slider-pointer-min'), 1);
    await dragSliderHandleTo(page, page.locator('.ngx-slider-pointer-max'), 50);

    await expect(page.getByTestId('product-price').first()).toBeVisible();

    await expect.poll(async () => {
      const prices = await page.getByTestId('product-price').allTextContents();
      if (prices.length === 0) return false;
      return prices.every(price => {
        const value = Number(price.replace(/[^0-9.]/g, ''));
        return value >= 1 && value <= 50;
      });
    }).toBe(true);
  });

});
