const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1700, height: 1000 } });
  await page.goto('http://localhost:5050');
  await page.waitForTimeout(1000);
  const card = await page.locator('.rw-map-card').first();
  if (card) {
    await card.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: 'test_current_full.png' });
  await browser.close();
  console.log('Done screenshot');
})();
