const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  
  await page.goto('http://localhost:5050/#/map/vietnam_63');
  await page.waitForTimeout(1000);
  
  // Click launch battle game button or navigate to live
  await page.evaluate(() => {
    if (typeof launchBattleGame === 'function') {
      launchBattleGame();
    }
  });
  
  await page.waitForTimeout(2000);
  
  // Screenshot the battle screen with live overlay
  await page.screenshot({ path: 'tiktok_hud_verified.png' });
  console.log('Screenshot saved to tiktok_hud_verified.png');
  
  await browser.close();
})();
